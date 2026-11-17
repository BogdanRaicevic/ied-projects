import { format } from "node:util";
import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  errorWrapper,
  zodErrorHandler,
} from "../../src/middleware/errorWrapper";

const req = { method: "POST", originalUrl: "/api/x" } as Request;

const mockRes = (headersSent = false) => {
  const json = vi.fn();
  const res = {
    headersSent,
    status: vi.fn(() => ({ json })),
  } as unknown as Response;
  return { res, json };
};

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("zodErrorHandler", () => {
  it("turns a ZodError from Schema.parse(req.query) into a 400", () => {
    const { res, json } = mockRes();
    const next = vi.fn();

    // ?email=a&email=b arrives as an array; it must be rejected, not cast.
    let error: unknown;
    try {
      z.object({ email: z.email() }).parse({ email: ["a@b.rs", "c@d.rs"] });
    } catch (e) {
      error = e;
    }

    zodErrorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Validation failed" }),
    );
    // Not passed on, so Sentry's error handler never sees it.
    expect(next).not.toHaveBeenCalled();
    // Logged for pm2 without going through console.error (Sentry Logs).
    expect(console.info).toHaveBeenCalledWith(
      "Validation failed:",
      "POST /api/x → 400",
      expect.any(Array),
    );
    expect(console.error).not.toHaveBeenCalled();
  });

  it("passes any other error on to Sentry and errorWrapper", () => {
    const { res } = mockRes();
    const next = vi.fn();
    const error = new Error("service failed");

    zodErrorHandler(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("errorWrapper", () => {
  it("answers a 500 as JSON, logging the error but not sending it", () => {
    const { res, json } = mockRes();
    const error = new Error("template exploded");

    errorWrapper(error, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: "Internal server error" });
    expect(console.error).toHaveBeenCalledWith(
      "Request failed:",
      "POST /api/x → 500",
      error,
    );
  });

  // With the URL as the first argument, Node reads %c in it as a format code
  // and drops the error from the log.
  it("keeps the error in the log when the URL contains a format code", () => {
    const error = new Error("template exploded");
    const reqWithCode = {
      method: "GET",
      originalUrl: "/api/x?q=%c4",
    } as Request;

    errorWrapper(error, reqWithCode, mockRes().res, vi.fn());

    const [args = []] = vi.mocked(console.error).mock.calls;
    const logged = format(...args);
    expect(logged).toContain("GET /api/x?q=%c4 → 500");
    expect(logged).toContain("template exploded");
  });

  it("answers a thrown non-Error as a JSON 500", () => {
    const { res, json } = mockRes();

    errorWrapper("oops", req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("keeps the status and message of a body-parser error", () => {
    const { res, json } = mockRes();
    const error = Object.assign(new Error("request entity too large"), {
      status: 413,
    });

    errorWrapper(error, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith({ message: "request entity too large" });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("leaves a response that already started to Express", () => {
    const { res } = mockRes(true);
    const next = vi.fn();
    const error = new Error("stream broke");

    errorWrapper(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});

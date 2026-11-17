import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { zodErrorHandler } from "../../src/middleware/errorWrapper";

describe("zodErrorHandler", () => {
  it("turns a ZodError from Schema.parse(req.query) into a 400", () => {
    const json = vi.fn();
    const res = { status: vi.fn(() => ({ json })) } as unknown as Response;
    const next = vi.fn();

    // ?email=a&email=b arrives as an array; it must be rejected, not cast.
    let error: unknown;
    try {
      z.object({ email: z.email() }).parse({ email: ["a@b.rs", "c@d.rs"] });
    } catch (e) {
      error = e;
    }

    zodErrorHandler(error, {} as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Validation failed" }),
    );
    // Not passed on, so Sentry's error handler never sees it.
    expect(next).not.toHaveBeenCalled();
  });

  it("passes any other error on to Sentry and errorWrapper", () => {
    const res = { status: vi.fn() } as unknown as Response;
    const next = vi.fn();
    const error = new Error("service failed");

    zodErrorHandler(error, {} as Request, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});

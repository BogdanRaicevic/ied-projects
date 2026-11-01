import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { errorWrapper } from "../../src/middleware/errorWrapper";

describe("errorWrapper", () => {
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

    errorWrapper(error, {} as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Validation failed" }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});

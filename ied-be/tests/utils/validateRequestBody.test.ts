import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { ZodError, z } from "zod";
import { validateRequestBody } from "../../src/middleware/validateSchema";

const call = (schema: z.ZodType, body: unknown) => {
  const req = { body } as Request;
  const next = vi.fn();
  return { req, next, run: validateRequestBody(schema)(req, {} as Response, next) };
};

describe("validateRequestBody", () => {
  // zodErrorHandler turns the rejection into the 400.
  it("rejects invalid input with a ZodError and does not call the handler", async () => {
    const { next, run } = call(z.object({ n: z.number() }), { n: "x" });

    await expect(run).rejects.toBeInstanceOf(ZodError);
    expect(next).not.toHaveBeenCalled();
  });

  it("replaces req.body with the parsed value and calls next", async () => {
    const { req, next, run } = call(z.object({ n: z.coerce.number() }), {
      n: "5",
    });
    await run;

    expect(req.body).toEqual({ n: 5 });
    expect(next).toHaveBeenCalledWith();
  });
});

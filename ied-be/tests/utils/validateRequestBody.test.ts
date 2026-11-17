import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validateRequestBody } from "../../src/middleware/validateSchema";

const call = (schema: z.ZodType, body: unknown) => {
  const json = vi.fn();
  const res = { status: vi.fn(() => ({ json })) } as unknown as Response;
  const req = { body } as Request;
  const next = vi.fn();
  vi.spyOn(console, "error").mockImplementation(() => {});
  return { req, res, json, next, run: validateRequestBody(schema)(req, res, next) };
};

describe("validateRequestBody", () => {
  it("answers invalid input with a 400 and does not call the handler", async () => {
    const { res, json, next, run } = call(z.object({ n: z.number() }), {
      n: "x",
    });
    await run;

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Validation failed" }),
    );
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

  // A throwing refine is a schema bug: it must reject so Express sends it to
  // Sentry, not be answered here with a 500 nobody sees.
  it("lets an error thrown inside the schema propagate", async () => {
    const bug = new Error("refine bug");
    const schema = z.object({ n: z.number() }).refine(() => {
      throw bug;
    });
    const { res, next, run } = call(schema, { n: 1 });

    await expect(run).rejects.toBe(bug);
    expect(res.status).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});

import type { RequestHandler } from "express";
import type { ZodType, z } from "zod";

// The return type carries the parsed body type to the route handler, so
// handlers need no `Request<…>` annotation or `req.body as X` cast. Params
// stay `any` here: a concrete type would override the ones Express infers
// from the route path.
export const validateRequestBody =
  <S extends ZodType>(
    schema: S,
    // biome-ignore lint/suspicious/noExplicitAny: see comment above
  ): RequestHandler<any, unknown, z.output<S>> =>
  async (req, _res, next) => {
    // A ZodError rejects to zodErrorHandler: 400, logged, kept out of Sentry.
    req.body = await schema.parseAsync(req.body);
    next();
  };

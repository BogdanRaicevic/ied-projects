import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string(), // TODO: add .email() to validate email
  password: z.string(), // TODO: add .min(8) to validate password
});

export type LoginSchema = z.infer<typeof LoginSchema>;

import z from "zod";

export const LastContacted = z.object({
  date: z.date(),
  userEmail: z.string(),
  type: z.enum(["email", "telefon"]),
});

export type LastContactedType = z.infer<typeof LastContacted>;

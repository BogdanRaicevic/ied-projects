import z from "zod";

export const Email = z
  .email("Neispravna email adresa")
  .max(100, "Predugacka email adresa")
  .or(z.literal(""))
  .optional();
export type Email = z.infer<typeof Email>;

export const ContactTypeEnum = z.enum(["email", "telefon"]);
export type ContactTypeEnum = z.infer<typeof ContactTypeEnum>;

export const LastContactedFromDB = z.object({
  date: z.date(),
  e_mail: Email,
  contact_type: ContactTypeEnum,
});

export type LastContactedFromDb = z.infer<typeof LastContactedFromDB>;

import z from "zod";
import { zDate } from "./date.zod";

export const Email = z
  .email("Neispravna email adresa")
  .max(100, "Predugacka email adresa")
  .or(z.literal(""))
  .optional();
export type Email = z.infer<typeof Email>;

export const ContactTypes = {
  informativni_poziv: "informativni_poziv",
  komercijalni_poziv: "komercijalni_poziv",
} as const;

export const ContactTypeEnum = z.enum(ContactTypes);
export type ContactTypeEnum = z.infer<typeof ContactTypeEnum>;

export const LastContactedFromDB = z.object({
  date: zDate(),
  e_mail: Email,
  contact_type: ContactTypeEnum,
});

export type LastContactedFromDb = z.infer<typeof LastContactedFromDB>;

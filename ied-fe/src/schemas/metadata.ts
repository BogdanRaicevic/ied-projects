import * as z from "zod";

const inputTypes = ["Text", "Switch", "Select", "TextMultiline"] as const;
export const InputTypesSchema = z.enum(inputTypes);
export type InputTypes = z.infer<typeof InputTypesSchema>;

const MetadataSchema = z.object({
  key: z.string(),
  label: z.string(),
  inputAdornment: z.any(),
  inputType: InputTypesSchema,
});

export type Metadata = z.infer<typeof MetadataSchema>;

import {
  Business,
  Home,
  LocationCity,
  ConfirmationNumber,
  Phone,
  Email,
  Approval,
  SwitchAccount,
  Height,
  Comment,
} from "@mui/icons-material";
import { Metadata, InputTypesSchema } from "../../../schemas/companySchemas";

export const companyFormMetadata: Metadata[] = [
  {
    key: "naziv_firme",
    label: "Naziv Firme",
    inputAdornment: <Business />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "adresa",
    label: "Adresa",
    inputAdornment: <Home />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "mesto",
    label: "Mesto",
    inputAdornment: <LocationCity />,
    inputType: InputTypesSchema.enum.Select,
  },
  {
    key: "PIB",
    label: "PIB",
    inputAdornment: <ConfirmationNumber />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "telefon",
    label: "Telefon",
    inputAdornment: <Phone />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "e_mail",
    label: "Email",
    inputAdornment: <Email />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "postanski_broj",
    label: "Postanski broj",
    inputAdornment: <Approval />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "tip_firme",
    label: "Tip firme",
    inputAdornment: <SwitchAccount />,
    inputType: InputTypesSchema.enum.Select,
  },
  {
    key: "velicina",
    label: "Velicina firme",
    inputAdornment: <Height />,
    inputType: InputTypesSchema.enum.Select,
  },
  {
    key: "stanje_firme",
    label: "Stanje firme",
    inputAdornment: <Comment />,
    inputType: InputTypesSchema.enum.Select,
  },
  {
    key: "komentar",
    label: "Komentari",
    inputAdornment: <Comment />,
    inputType: InputTypesSchema.enum.TextMultiline,
  },
];

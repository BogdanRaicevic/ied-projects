import {
  AccountCircle,
  Approval,
  Business,
  Comment,
  ConfirmationNumber,
  DonutSmall,
  Email,
  Height,
  Home,
  LocationCity,
  MonitorHeart,
  Person,
  Phone,
  SwitchAccount,
  TravelExplore,
  Warning,
} from "@mui/icons-material";
import { Metadata, InputTypesSchema } from "../../../schemas/companySchemas";

export const companyFormMetadata: Metadata[] = [
  { key: "odjava", label: "Odjava", inputAdornment: <Warning />, inputType: InputTypesSchema.enum.Switch },
  { key: "naziv", label: "Naziv kompanije", inputAdornment: <Business />, inputType: InputTypesSchema.enum.Text },
  { key: "sajt", label: "Sajt", inputAdornment: <TravelExplore />, inputType: InputTypesSchema.enum.Text },
  { key: "adresa", label: "Adresa", inputAdornment: <Home />, inputType: InputTypesSchema.enum.Text },
  { key: "grad", label: "Grad", inputAdornment: <LocationCity />, inputType: InputTypesSchema.enum.Text },
  { key: "opstina", label: "Opstina", inputAdornment: <DonutSmall />, inputType: InputTypesSchema.enum.Text },
  { key: "pib", label: "PIB", inputAdornment: <ConfirmationNumber />, inputType: InputTypesSchema.enum.Text },
  { key: "telefon", label: "Telefon", inputAdornment: <Phone />, inputType: InputTypesSchema.enum.Text },
  { key: "email", label: "Email", inputAdornment: <Email />, inputType: InputTypesSchema.enum.Text },
  { key: "ptt", label: "Postanski broj", inputAdornment: <Approval />, inputType: InputTypesSchema.enum.Text },
  { key: "tip", label: "Tip firme", inputAdornment: <SwitchAccount />, inputType: InputTypesSchema.enum.Select },
  { key: "velicina", label: "Velicina firme", inputAdornment: <Height />, inputType: InputTypesSchema.enum.Select },
  { key: "stanje", label: "Stanje firme", inputAdornment: <MonitorHeart />, inputType: InputTypesSchema.enum.Select },
  { key: "komentari", label: "Komentari", inputAdornment: <Comment />, inputType: InputTypesSchema.enum.TextMultiline },
];

export const zaposleniFormMetadata: Metadata[] = [
  { key: "ime", label: "Ime", inputAdornment: <AccountCircle />, inputType: InputTypesSchema.enum.Text },
  { key: "prezime", label: "Prezime", inputAdornment: <Person />, inputType: InputTypesSchema.enum.Text },
  { key: "email", label: "Email", inputAdornment: <Email />, inputType: InputTypesSchema.enum.Text },
  { key: "telefon", label: "Telefon", inputAdornment: <Phone />, inputType: InputTypesSchema.enum.Text },
];

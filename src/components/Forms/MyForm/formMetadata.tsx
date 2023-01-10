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
import { ReactElement } from "react";

export interface IMetadata {
  key: string;
  label: string;
  inputAdornment: ReactElement;
  inputType: InputTypes;
}

export enum InputTypes {
  Text = "text",
  Switch = "switch",
  Select = "select",
  TextMultiline = "multiline",
}

export const companyFormMetadata: IMetadata[] = [
  { key: "odjava", label: "Odjava", inputAdornment: <Warning />, inputType: InputTypes.Switch },
  { key: "naziv", label: "Naziv kompanije", inputAdornment: <Business />, inputType: InputTypes.Text },
  { key: "sajt", label: "Sajt", inputAdornment: <TravelExplore />, inputType: InputTypes.Text },
  { key: "adresa", label: "Adresa", inputAdornment: <Home />, inputType: InputTypes.Text },
  { key: "grad", label: "Grad", inputAdornment: <LocationCity />, inputType: InputTypes.Text },
  { key: "opstina", label: "Opstina", inputAdornment: <DonutSmall />, inputType: InputTypes.Text },
  { key: "pib", label: "PIB", inputAdornment: <ConfirmationNumber />, inputType: InputTypes.Text },
  { key: "telefon", label: "Telefon", inputAdornment: <Phone />, inputType: InputTypes.Text },
  { key: "email", label: "Email", inputAdornment: <Email />, inputType: InputTypes.Text },
  { key: "ptt", label: "Postanski broj", inputAdornment: <Approval />, inputType: InputTypes.Text },
  { key: "tip", label: "Tip firme", inputAdornment: <SwitchAccount />, inputType: InputTypes.Select },
  { key: "velicina", label: "Velicina firme", inputAdornment: <Height />, inputType: InputTypes.Select },
  { key: "stanje", label: "Stanje firme", inputAdornment: <MonitorHeart />, inputType: InputTypes.Select },
  { key: "komentari", label: "Komentari", inputAdornment: <Comment />, inputType: InputTypes.TextMultiline },
];

export const zaposleniFormMetadata: IMetadata[] = [
  { key: "ime", label: "Ime", inputAdornment: <AccountCircle />, inputType: InputTypes.Text },
  { key: "prezime", label: "Prezime", inputAdornment: <Person />, inputType: InputTypes.Text },
  { key: "email", label: "Email", inputAdornment: <Email />, inputType: InputTypes.Text },
  { key: "telefon", label: "Telefon", inputAdornment: <Phone />, inputType: InputTypes.Text },
];

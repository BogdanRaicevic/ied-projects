import { AccountCircle, Email, Person, Phone } from "@mui/icons-material";

export const clientFormMetadata = [
  { key: "ime", label: "Ime", inputAdornment: <AccountCircle /> },
  { key: "prezime", label: "Prezime", inputAdornment: <Person /> },
  { key: "email", label: "Email", inputAdornment: <Email /> },
  { key: "tel", label: "Telefon", inputAdornment: <Phone /> },
];

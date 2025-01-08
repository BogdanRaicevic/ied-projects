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
	Filter1,
	LocalPolice,
	BuildCircle,
} from "@mui/icons-material";
import {
	type Metadata,
	InputTypesSchema,
} from "../../../schemas/companySchemas";

export const firmaFormMetadata: Metadata[] = [
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
		key: "jbkjs",
		label: "JBKJS",
		inputAdornment: <Filter1 />,
		inputType: InputTypesSchema.enum.Text,
	},
	{
		key: "maticni_broj",
		label: "Maticni Broj",
		inputAdornment: <LocalPolice />,
		inputType: InputTypesSchema.enum.Text,
	},
	{
		key: "tip_firme",
		label: "Tip firme",
		inputAdornment: <SwitchAccount />,
		inputType: InputTypesSchema.enum.Select,
	},
	{
		key: "velicina_firme",
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
	{
		key: "delatnost",
		label: "Delatnosti",
		inputAdornment: <BuildCircle />,
		inputType: InputTypesSchema.enum.Select,
	},
];

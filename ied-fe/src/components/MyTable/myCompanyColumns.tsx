import { ContentCopy } from "@mui/icons-material";
import type { MRT_ColumnDef } from "material-react-table";
import type { FirmaType, Zaposleni } from "../../schemas/companySchemas";
import { Icon, Link } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";

export const myCompanyColumns: MRT_ColumnDef<FirmaType>[] = [
	// {
	//   header: "Prijavljeni",
	//   accessorKey: "zeleMarketingMaterijal",
	//   muiTableBodyCellProps: ({ cell }) => ({
	//     sx: {
	//       backgroundColor: cell.getValue() === true ? "#47e147" : "salmon",
	//     },
	//   }),
	//   Cell: ({ cell }) => <span>{cell.getValue<boolean>() ? "DA" : "Ne"}</span>,
	// },
	{
		header: "Naziv kompanije",
		accessorKey: "naziv_firme",
		Cell: ({ row }: { row: { original: FirmaType } }) => {
			const firma = row.original;
			return (
				<Link
					href={`/Firma/${firma._id}`}
					target="_blank"
					rel="noopener noreferrer"
					sx={{ display: "inline-flex", alignItems: "center" }}
				>
					<Icon
						component={BusinessIcon}
						sx={{ fontSize: 20, marginRight: 0.5 }}
					/>
					{firma.naziv_firme}
				</Link>
			);
		},
	},
	{
		header: "Email",
		accessorKey: "e_mail",
		enableClickToCopy: true,
		muiCopyButtonProps: {
			fullWidth: true,
			startIcon: <ContentCopy />,
			sx: { justifyContent: "flex-start" },
		},
	},

	{
		header: "Adresa",
		accessorKey: "adresa",
	},
	{
		header: "Mesto",
		accessorKey: "mesto",
	},
	{
		header: "Postanski broj",
		accessorKey: "postanski_broj",
	},
	{
		header: "Telefon",
		accessorKey: "telefon",
	},
	{
		header: "Tip firme",
		accessorKey: "tip_firme",
	},
	{
		header: "Velicina",
		accessorKey: "velicina",
	},
	{
		header: "Komentari",
		accessorKey: "komentar",
		muiTableHeadCellProps: {
			sx: {
				minWidth: "400px",
			},
		},
		muiTableBodyCellProps: {
			sx: {
				whiteSpace: "pre-wrap", // Preserve line breaks and whitespace
			},
		},
	},
];

export const myZaposleniColumns: MRT_ColumnDef<Zaposleni>[] = [
	{
		header: "Ime i Prezime",
		accessorFn: (row) => `${row.ime} ${row.prezime}`,
	},
	{
		header: "Email",
		accessorKey: "e_mail",
		enableClickToCopy: true,
		muiCopyButtonProps: {
			fullWidth: true,
			startIcon: <ContentCopy />,
			sx: { justifyContent: "flex-start" },
		},
	},
	{
		header: "Telefon",
		accessorKey: "telefon",
	},
	{
		header: "Radna mesta",
		accessorKey: "radno_mesto",
		accessorFn: (row) => row.radno_mesto,
	},
	{
		header: "Komentari",
		accessorKey: "komentar",
		muiTableHeadCellProps: {
			sx: {
				minWidth: "400px",
			},
		},
		muiTableBodyCellProps: {
			sx: {
				whiteSpace: "pre-wrap", // Preserve line breaks and whitespace
			},
		},
	},
];

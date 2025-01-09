import { useEffect, useMemo, useState, memo } from "react";
import type { Seminar } from "../../schemas/firmaSchemas";
import {
	MaterialReactTable,
	type MRT_ColumnDef,
	useMaterialReactTable,
	type MRT_PaginationState,
} from "material-react-table";
import { deleteSeminar, fetchSeminari } from "../../api/seminari.api";
import type { SeminarQueryParams } from "ied-shared/types/seminar";
import {
	Box,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import PrijaveSeminarTable from "./PrijaveSeminarTable";
import SeminarForm from "./SeminarForm";

export default memo(function SeminariTable(props: {
	queryParameters: SeminarQueryParams;
}) {
	const [data, setData] = useState<Seminar[]>([]);
	const [documents, setDocuments] = useState(1000);
	const [deletePrijavaCounter, setDeletePrijavaCounter] = useState(0);
	const [deleteSeminarCounter, setDeleteSeminarCounter] = useState(0);
	const [editSeminar, setEditSeminar] = useState(false);
	const [selectedSeminar, setSelectedSeminar] = useState<Omit<
		Seminar,
		"prijave" | "datumOd" | "datumDo" | "cenaOd" | "cenaDo"
	> | null>(null);

	const [pagination, setPagination] = useState<MRT_PaginationState>({
		pageIndex: 0,
		pageSize: 50,
	});

	useEffect(() => {
		const loadData = async () => {
			const { pageIndex, pageSize } = table.getState().pagination;
			const res = await fetchSeminari(
				pageSize,
				pageIndex,
				props.queryParameters,
			);
			setData(res.seminari);
			setDocuments(res.totalDocuments);
		};
		loadData();
	}, [
		pagination,
		documents,
		props,
		deletePrijavaCounter,
		deleteSeminarCounter,
	]);

	const handleDelete = async (id: string) => {
		await deleteSeminar(id);
	};

	const handleEditSeminar = (id: string) => {
		console.log("data", data);
		const seminar = data.find((s) => s._id === id);
		console.log("seminar", seminar);
		setSelectedSeminar(seminar);
		setEditSeminar(true);
	};

	const seminariTableColumns: MRT_ColumnDef<Seminar>[] = [
		{
			id: "actions",
			header: "Akcije",
			size: 100,
			Cell: ({ row }) => {
				const seminar: Partial<Seminar> = row.original;
				return (
					<Box sx={{ display: "flex", gap: "1rem" }}>
						<Tooltip title="Edit">
							<IconButton
								color="info"
								onClick={() => {
									if (seminar._id) {
										handleEditSeminar(seminar._id);
									}
								}}
							>
								<EditIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete">
							<IconButton
								color="error"
								onClick={() => {
									if (
										window.confirm(
											"Da li ste sigurni da želite da obrišete seminar?",
										)
									) {
										if (seminar._id) {
											handleDelete(seminar._id);
											setDeleteSeminarCounter((prev) => prev + 1);
										}
									}
								}}
							>
								<DeleteIcon />
							</IconButton>
						</Tooltip>
					</Box>
				);
			},
		},
		{
			header: "Naziv Seminara",
			accessorKey: "naziv",
		},
		{
			header: "Predavač",
			accessorKey: "predavac",
		},
		{
			header: "Lokacija",
			accessorKey: "lokacija",
		},
		{
			header: "Datum",
			accessorKey: "datum",
		},
		{
			header: "Broj Učesnika",
			accessorFn: (row) => row.prijave?.length || 0,
		},
	];

	const table = useMaterialReactTable({
		columns: useMemo<MRT_ColumnDef<Seminar>[]>(() => seminariTableColumns, []),
		data: useMemo<Seminar[]>(() => data, [data]),
		enableColumnFilterModes: true,
		enableColumnOrdering: true,
		enableColumnPinning: true,
		paginationDisplayMode: "default",
		positionToolbarAlertBanner: "bottom",
		manualPagination: true,
		onPaginationChange: setPagination,
		enablePagination: true,
		state: {
			pagination,
		},
		rowCount: documents,
		enableExpanding: true,
		renderDetailPanel: (row) => {
			const participants = row.row.original.prijave;
			const seminarId = row.row.original._id;

			if (seminarId) {
				for (const p of participants) {
					p.seminar_id = seminarId;
				}
			}

			const groupedParticipants = participants.reduce(
				(acc, curr) => {
					const key = curr.firma_naziv;
					if (!key) {
						return acc;
					}

					if (!acc[key]) {
						acc[key] = [];
					}
					acc[key].push(curr);
					return acc;
				},
				{} as Record<string, typeof participants>,
			);

			return (
				participants.length > 0 && (
					<TableContainer component={Paper}>
						<Table size="small">
							<TableHead>
								<TableRow
									sx={{
										"& > *": { borderBottom: "unset" },
										backgroundColor: "#95bb9f",
									}}
								>
									<TableCell />
									<TableCell>Naziv Firme</TableCell>
									<TableCell>Email</TableCell>
									<TableCell>Telefon</TableCell>
									<TableCell>Broj Prijavljenih</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{Object.entries(groupedParticipants).map(
									([naziv_firme, prijave]) => (
										<PrijaveSeminarTable
											key={naziv_firme}
											prijave={prijave}
											onDelete={() => {
												setDeletePrijavaCounter((prev) => prev + 1);
											}}
										/>
									),
								)}
							</TableBody>
						</Table>
					</TableContainer>
				)
			);
		},
	});
	return (
		<>
			<MaterialReactTable table={table} />
			<Dialog
				open={editSeminar}
				onClose={() => setEditSeminar(false)}
				maxWidth="lg"
			>
				<DialogContent>
					<Box sx={{ p: 2 }}>
						<SeminarForm seminar={selectedSeminar} />
					</Box>
				</DialogContent>
			</Dialog>
		</>
	);
});

import { useEffect, useMemo, useState, memo } from "react";
import type { PrijavaNaSeminar, Seminar } from "../../schemas/companySchemas";
import {
	MaterialReactTable,
	type MRT_ColumnDef,
	useMaterialReactTable,
	type MRT_PaginationState,
} from "material-react-table";
import { fetchSeminari } from "../../api/seminari.api";
import type { SeminarQueryParams } from "ied-shared/types/seminar";
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";

import PrijaveSeminarTable from "./PrijaveSeminarTable";

export default memo(function SeminariTable(props: {
	queryParameters: SeminarQueryParams;
}) {
	const [data, setData] = useState<Seminar[]>([]);
	const [documents, setDocuments] = useState(1000);

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
	}, [pagination, documents, props]);

	const seminariTableColumns: MRT_ColumnDef<Seminar>[] = [
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
			const participants = row.row.original.prijave as PrijavaNaSeminar[];
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
										<PrijaveSeminarTable key={naziv_firme} prijave={prijave} />
									),
								)}
							</TableBody>
						</Table>
					</TableContainer>
				)
			);
		},
	});
	return <MaterialReactTable table={table} />;
});

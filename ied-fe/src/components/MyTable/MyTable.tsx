import { useEffect, useMemo, useState, memo } from "react";
import type { FirmaType } from "../../schemas/firmaSchemas";
import { myCompanyColumns } from "./myCompanyColumns";
import {
	MaterialReactTable,
	type MRT_ColumnDef,
	useMaterialReactTable,
	type MRT_PaginationState,
} from "material-react-table";
import { fetchFirmaPretrageData } from "../../api/firma.api";
import type { PretragaParametersType } from "../../store/pretragaParameters.store";

export default memo(function MyTable(queryParameters: PretragaParametersType) {
	const [data, setData] = useState<FirmaType[]>([]);
	const [documents, setDocuments] = useState(1000);

	const [pagination, setPagination] = useState<MRT_PaginationState>({
		pageIndex: 0,
		pageSize: 50,
	});

	useEffect(() => {
		const loadData = async () => {
			const { pageIndex, pageSize } = table.getState().pagination;
			const res = await fetchFirmaPretrageData(
				pageSize,
				pageIndex,
				queryParameters,
			);
			setData(res.firmas);
			setDocuments(res.totalDocuments);
		};
		loadData();
	}, [pagination, documents, queryParameters]);

	const table = useMaterialReactTable({
		columns: useMemo<MRT_ColumnDef<FirmaType>[]>(() => myCompanyColumns, []),
		data: useMemo<FirmaType[]>(() => data, [data]),
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
	});
	return <MaterialReactTable table={table} />;
});

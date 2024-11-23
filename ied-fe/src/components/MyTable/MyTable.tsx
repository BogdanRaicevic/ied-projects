import { useEffect, useMemo, useState, memo } from "react";
import { Company } from "../../schemas/companySchemas";
import { myCompanyColumns } from "./myCompanyColumns";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  MRT_PaginationState,
} from "material-react-table";
import { fetchFirmaPretrageData } from "../../api/firma.api";
import { PretragaParametersType } from "../../store/pretragaParameters.store";
import { useAuth } from "@clerk/clerk-react";

export default memo(function MyTable(queryParameters: PretragaParametersType) {
  const [data, setData] = useState<Company[]>([]);
  const [documents, setDocuments] = useState(1000);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { getToken } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const token = await getToken();
      const res = await fetchFirmaPretrageData(pageSize, pageIndex, queryParameters, token);
      setData(res.firmas);
      setDocuments(res.totalDocuments);
    };
    loadData();
  }, [pagination, documents, queryParameters]);

  const table = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<Company>[]>(() => myCompanyColumns, []),
    data: useMemo<Company[]>(() => data, [data]),
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

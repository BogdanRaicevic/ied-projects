import { useEffect, useMemo, useState, memo } from "react";
import type { FirmaType } from "../../schemas/firmaSchemas";
import { myCompanyColumns } from "./myCompanyColumns";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_PaginationState,
} from "material-react-table";
import { fetchFirmaPretrage } from "../../api/firma.api";
import { FirmaQueryParams } from "@ied-shared/types/firmaQueryParams";

export default memo(function MyTable(queryParameters: FirmaQueryParams) {
  const [data, setData] = useState<FirmaType[]>([]);
  const [documents, setDocuments] = useState(1000);

  const defaultPagination = { pageIndex: 0, pageSize: 50 };
  const [pagination, setPagination] = useState<MRT_PaginationState>(() => {
    const saved = localStorage.getItem("myTablePagination");
    return saved ? JSON.parse(saved) : defaultPagination;
  });

  useEffect(() => {
    setPagination(defaultPagination);
  }, [queryParameters]);

  useEffect(() => {
    localStorage.setItem("myTablePagination", JSON.stringify(pagination));
  }, [pagination]);

  useEffect(() => {
    const loadData = async () => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const res = await fetchFirmaPretrage(pageSize, pageIndex, queryParameters);
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

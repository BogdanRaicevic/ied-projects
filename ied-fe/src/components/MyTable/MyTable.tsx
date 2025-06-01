import { useEffect, useMemo, useState, memo } from "react";
import type { FirmaType } from "../../schemas/firmaSchemas";
import { myCompanyColumns } from "./myCompanyColumns";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { fetchFirmaPretrage } from "../../api/firma.api";
import { FirmaQueryParams } from "@ied-shared/types/firmaQueryParams";
import { usePretragaStore } from "../../store/pretragaParameters.store";

export default memo(function MyTable(queryParameters: FirmaQueryParams) {
  const [data, setData] = useState<FirmaType[]>([]);
  const [documents, setDocuments] = useState(1000);

  const { pagination, setPaginationParameters } = usePretragaStore();

  useEffect(() => {
    const loadData = async () => {
      const { pageIndex, pageSize } = pagination;
      const res = await fetchFirmaPretrage(pageSize, pageIndex, queryParameters);
      setData(res.firmas);
      setDocuments(res.totalDocuments);
    };
    loadData();
  }, [pagination.pageIndex, pagination.pageSize, queryParameters]);

  const table = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<FirmaType>[]>(() => myCompanyColumns, []),
    data: useMemo<FirmaType[]>(() => data, [data]),
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    paginationDisplayMode: "default",
    positionToolbarAlertBanner: "bottom",
    manualPagination: true,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater(pagination);
        setPaginationParameters(newPagination);
      } else {
        setPaginationParameters(updater);
      }
    },
    enablePagination: true,
    state: {
      pagination,
    },
    rowCount: documents,
    initialState: {
      columnPinning: {
        left: ["rowNumber", "naziv_firme"],
      },
    },
  });
  return <MaterialReactTable table={table} />;
});

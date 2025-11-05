import { red } from "@mui/material/colors";
import type { FirmaType } from "ied-shared";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import { fetchFirmaPretrage } from "../../api/firma.api";
import { useTopScrollbar } from "../../hooks/useTopScrollbar";
import { usePretragaStore } from "../../store/pretragaParameters.store";
import { firmaColumns } from "./firmaColumns";

export const FirmasTable = () => {
  const [data, setData] = useState<FirmaType[]>([]);
  const [documents, setDocuments] = useState(1000);

  const { pagination, setPaginationParameters, appliedParameters } =
    usePretragaStore();

  useEffect(() => {
    const loadData = async () => {
      const { pageIndex, pageSize } = pagination;
      const res = await fetchFirmaPretrage(
        pageSize,
        pageIndex,
        appliedParameters,
      );
      setData(res.firmas);
      setDocuments(res.totalDocuments);
    };
    loadData();
  }, [pagination.pageIndex, pagination.pageSize, appliedParameters]);

  const scrollbarProps = useTopScrollbar<FirmaType>();

  const table = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<FirmaType>[]>(() => firmaColumns, []),
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
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor:
          row.original.prijavljeni === false ? red[100] : "inherit",
      },
    }),
    ...scrollbarProps,
  });
  return <MaterialReactTable table={table} />;
};

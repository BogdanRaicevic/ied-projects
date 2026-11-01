import { red } from "@mui/material/colors";
import type { FirmaType } from "ied-shared";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo } from "react";
import { useFirmaPretrage } from "../../hooks/firma/useFirmaQueries";
import { useTopScrollbar } from "../../hooks/useTopScrollbar";
import { usePretragaStore } from "../../store/pretragaParameters.store";
import { firmaColumns } from "./firmaColumns";

export const FirmasTable = () => {
  const { pagination, setPaginationParameters, appliedParameters } =
    usePretragaStore();

  const { data: res, isFetching } = useFirmaPretrage(
    pagination.pageIndex,
    pagination.pageSize,
    appliedParameters,
  );

  const scrollbarProps = useTopScrollbar<FirmaType>();

  const table = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<FirmaType>[]>(() => firmaColumns, []),
    data: res?.firmas ?? [],
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
      showProgressBars: isFetching,
    },
    rowCount: res?.totalDocuments ?? 0,
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

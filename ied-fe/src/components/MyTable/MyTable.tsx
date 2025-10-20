import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { fetchFirmaPretrage } from "../../api/firma.api";
import type { FirmaType } from "../../schemas/firmaSchemas";
import { usePretragaStore } from "../../store/pretragaParameters.store";
import { myCompanyColumns } from "./myCompanyColumns";

export default memo(function MyTable() {
  const [data, setData] = useState<FirmaType[]>([]);
  const [documents, setDocuments] = useState(1000);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topToolbarRef = useRef<HTMLDivElement>(null);

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

  const table = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<FirmaType>[]>(() => myCompanyColumns, []),
    data: useMemo<FirmaType[]>(() => data, [data]),
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    paginationDisplayMode: "default",
    positionToolbarAlertBanner: "bottom",
    manualPagination: true,
    renderTopToolbar: () => (
      <div
        ref={topToolbarRef}
        style={{
          overflowX: "auto",
          width: "100%",
        }}
        onScroll={(e) => {
          if (tableContainerRef.current) {
            tableContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
          }
        }}
      >
        <div style={{ width: `${table.getTotalSize()}px`, height: "1px" }} />
      </div>
    ),
    muiTableContainerProps: {
      ref: tableContainerRef,
      onScroll: (e) => {
        if (topToolbarRef.current) {
          topToolbarRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
      },
    },
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

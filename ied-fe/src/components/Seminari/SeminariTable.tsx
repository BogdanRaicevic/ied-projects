import { useEffect, useMemo, useState, memo } from "react";
import { Seminar } from "../../schemas/companySchemas";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  MRT_PaginationState,
} from "material-react-table";
import { fetchSeminari } from "../../api/seminari.api";

export default memo(function SeminariTable(queryParameters: any) {
  const [data, setData] = useState<Seminar[]>([]);
  const [documents, setDocuments] = useState(1000);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const loadData = async () => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const res = await fetchSeminari(pageSize, pageIndex, queryParameters);
      console.log("ovo su seminari", res);
      setData(res.seminari);
      setDocuments(res.totalDocuments);
    };
    loadData();
  }, [pagination, documents, queryParameters]);

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
      accessorKey: "broj_ucesnika",
    },
    {
      header: "Cena",
      accessorKey: "cena",
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
  });
  return <MaterialReactTable table={table} />;
});

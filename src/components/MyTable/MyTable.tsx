import { useMemo } from "react";
import { Company } from "../../schemas/companySchemas";
import { myCompanyColumns } from "./myCompanyColumns";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";

type Props = {
  data: Company[];
};

export default function MyTable({ data }: Props) {
  const table = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<Company>[]>(() => myCompanyColumns, []),
    data: useMemo<Company[]>(() => data, [data]), //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "rounded",
      variant: "outlined",
    },
  });
  return <MaterialReactTable table={table} />;
}

import { useMemo } from "react";
import { Company } from "../../schemas/companySchemas";
import { myCompanyColumns } from "./myCompanyColumns";
import { AccountCircle } from "@mui/icons-material";
import { MenuItem, ListItemIcon } from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import { useNavigate } from "react-router-dom";

type Props = {
  data: Company[];
};

export default function MyTable({ data }: Props) {
  // first remove memo, and add if needed
  const companyColumns = useMemo<MRT_ColumnDef<Company>[]>(() => myCompanyColumns, []);
  const memoizedData = useMemo<Company[]>(() => data, [data]);
  const navigate = useNavigate();

  const table = useMaterialReactTable({
    columns: companyColumns,
    data: memoizedData, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableRowActions: true,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "rounded",
      variant: "outlined",
    },
    renderRowActionMenuItems: ({ closeMenu, row }: any) => [
      <MenuItem
        key={0}
        onClick={() => {
          console.log("this be3: ", row.original);
          // View profile logic...
          navigate("/firma", { state: row.original });
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <AccountCircle />
        </ListItemIcon>
        View Profile
      </MenuItem>,
    ],
  });

  return <MaterialReactTable table={table} />;
}

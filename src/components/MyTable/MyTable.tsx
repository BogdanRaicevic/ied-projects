import React, { useMemo } from "react";
import MaterialReactTable from "material-react-table";
import type { MRT_ColumnDef } from "material-react-table"; // If using TypeScript (optional, but recommended)
import { Company, Zaposleni } from "../../schemas/companySchemas";
import { myCompanyColumns, myZaposleniColumns } from "./myCompanyColumns";
import { Box } from "@mui/material";

type Props = {
  data: Company[];
};

export default function MyTable(props: Props) {
  const companyColumns = useMemo<MRT_ColumnDef<Company>[]>(() => myCompanyColumns, []);
  const zaposleniColumns = useMemo<MRT_ColumnDef<Zaposleni>[]>(() => myZaposleniColumns, []);

  return (
    <MaterialReactTable
      columns={companyColumns}
      data={props.data}
      enableColumnOrdering
      enableGlobalFilter={true} //turn off a feature
      renderDetailPanel={({ row }) => renderZaposleniTable(row)}
    />
  );

  function renderZaposleniTable(row): React.ReactNode {
    return (
      <Box width={1000} sx={{ boxShadow: 3 }}>
        <MaterialReactTable
          columns={zaposleniColumns}
          data={row.original.zaposleni}
          enableColumnOrdering
          enableGlobalFilter={true} //turn off a feature
          muiTableProps={{ width: 10 }}
        />
      </Box>
    );
  }
}

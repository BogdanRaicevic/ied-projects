import { Box } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table"; // If using TypeScript (optional, but recommended)
import MaterialReactTable from "material-react-table";
import React, { useMemo } from "react";
import { Company, Zaposleni } from "../../schemas/companySchemas";
import { myCompanyColumns, myZaposleniColumns } from "./myCompanyColumns";

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
      muiTableProps={{
        sx: {
          "table, th, td": {
            border: 1,
            borderColor: "lightgray",
            borderStyle: "solid",
          },
          th: {
            backgroundColor: "#adadad",
          },
          "& tr:nth-of-type(4n+1)": {
            backgroundColor: "#e3f2f7",
          },
        },
      }}
    />
  );

  function renderZaposleniTable(row: any): React.ReactNode {
    return (
      <Box width={1000} sx={{ boxShadow: 3 }}>
        <MaterialReactTable
          columns={zaposleniColumns}
          data={row.original.zaposleni}
          enableColumnOrdering
          enableGlobalFilter={true}
          muiTableProps={{
            sx: {
              "& tr:nth-of-type(2n + 1)": {
                backgroundColor: "#e3f2f7 !important",
              },
            },
          }}
        />
      </Box>
    );
  }
}

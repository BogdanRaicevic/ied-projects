import type { MRT_ColumnDef } from "material-react-table"; // If using TypeScript (optional, but recommended)
import MaterialReactTable from "material-react-table";
import { useMemo } from "react";
import { Company } from "../../schemas/companySchemas";
import { myCompanyColumns } from "./myCompanyColumns";

type Props = {
  data: Company[];
};

export default function MyTable(props: Props) {
  // first remove memo, and add if needed
  const companyColumns = useMemo<MRT_ColumnDef<Company>[]>(() => myCompanyColumns, []);

  return (
    <MaterialReactTable
      columns={companyColumns}
      data={props.data}
      enableColumnOrdering
      enableGlobalFilter={true} //turn off a feature
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
}

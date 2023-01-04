import { useMemo } from "react";
import { useTable } from "react-table";
import { companiesData, IOptionalCompanyData } from "../../fakeData/companyData";
import { CompanyGridColumns } from "./columns";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import { Paper } from "@mui/material";
import { MyTableHead } from "./MyTableHeader";
import { MyTableBody } from "./MyTableBody";

export default function CompaniesDataGrid() {
  const columns = useMemo(() => CompanyGridColumns, []);
  const data: IOptionalCompanyData[] = useMemo(() => companiesData, []);

  const tableInstance = useTable({ columns, data });
  const { getTableBodyProps, getTableProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        {MyTableHead(headerGroups)}
        {MyTableBody(getTableBodyProps, rows, prepareRow)}
      </Table>
      <br />
    </TableContainer>
  );
}

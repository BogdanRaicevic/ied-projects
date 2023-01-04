import { useTable, useSortBy, useExpanded } from "react-table";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import { Paper } from "@mui/material";
import { MyTableHead } from "./MyTableHeader";
import { MyTableBody } from "./MyTableBody";

export default function CompaniesTable({ columns, data, renderRowSubComponent }) {
  const tableInstance = useTable({ columns, data }, useSortBy, useExpanded);
  const { getTableBodyProps, getTableProps, headerGroups, rows, prepareRow, visibleColumns } = tableInstance;

  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        {MyTableHead(headerGroups)}
        {MyTableBody(getTableBodyProps, rows, prepareRow, visibleColumns, renderRowSubComponent)}
      </Table>
      <br />
    </TableContainer>
  );
}

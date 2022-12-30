import { useMemo } from "react";
import { useTable } from "react-table";
import { companiesData } from "../../fakeData/companyData";
import { companyGridColumns } from "./columns";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { TableRow } from "@mui/material";

export default function CompaniesDataGrid() {
  const columns = useMemo(() => companyGridColumns, []);
  const data = useMemo(() => companiesData, []);

  const tableInstance = useTable({ columns, data });
  const { getTableBodyProps, getTableProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <TableContainer>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableCell {...column.getHeaderProps()}>{column.render("Header")}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <TableCell {...cell.getCellProps()}>{cell.render("Cell")}</TableCell>;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <br />
    </TableContainer>
  );
}

import { useMemo } from "react";
import { useTable } from "react-table";
import { companiesData, IOptionalCompanyData } from "../../fakeData/companyData";
import { CompanyGridColumns } from "./columns";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { Paper, styled, TableRow } from "@mui/material";

export default function CompaniesDataGrid() {
  const columns = useMemo(() => CompanyGridColumns, []);
  const data: IOptionalCompanyData[] = useMemo(() => companiesData, []);

  const tableInstance = useTable({ columns, data });
  const { getTableBodyProps, getTableProps, headerGroups, rows, prepareRow } = tableInstance;

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <StyledTableCell component={"th"} scope="row" align="left" {...column.getHeaderProps()}>
                  {column.render("Header")}
                </StyledTableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <StyledTableRow {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <TableCell {...cell.getCellProps()}>{cell.render("Cell")}</TableCell>;
                })}
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
      <br />
    </TableContainer>
  );
}

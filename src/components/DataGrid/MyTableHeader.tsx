import { styled, TableCell, tableCellClasses, TableHead, TableRow } from "@mui/material";
import { HeaderGroup } from "react-table";
import { IOptionalCompanyData } from "../../fakeData/companyData";

export function MyTableHead(headerGroups: HeaderGroup<IOptionalCompanyData>[]) {
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  return (
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
  );
}

import { ImportExport, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { styled, TableCell, tableCellClasses, TableHead, TableRow, Typography } from "@mui/material";
import { HeaderGroup } from "react-table";
import { Company } from "../../schemas/companySchemas";

export function MyTableHead(headerGroups: HeaderGroup<Company>[]) {
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
            <StyledTableCell
              component={"th"}
              scope="row"
              align="left"
              {...column.getHeaderProps(column.getSortByToggleProps())}
            >
              <span style={{ display: "flex" }}>
                <Typography noWrap>{column.render("Header")}</Typography>
                <span style={{ marginLeft: 10 }}>
                  {column.isSorted ? (
                    column.isSortedDesc ? (
                      <KeyboardArrowDown></KeyboardArrowDown>
                    ) : (
                      <KeyboardArrowUp></KeyboardArrowUp>
                    )
                  ) : (
                    <ImportExport></ImportExport>
                  )}
                </span>
              </span>
            </StyledTableCell>
          ))}
        </TableRow>
      ))}
    </TableHead>
  );
}

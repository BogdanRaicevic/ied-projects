import { styled, TableRow, TableBody, TableCell } from "@mui/material";
import { Fragment, useCallback } from "react";
import { TablePropGetter, TableProps, Row } from "react-table";
import { IOptionalCompanyData } from "../../fakeData/companyData";

export function MyTableBody(
  getTableBodyProps: (propGetter?: TablePropGetter<IOptionalCompanyData> | undefined) => TableProps,
  rows: Row<IOptionalCompanyData>[],
  prepareRow: (row: Row<IOptionalCompanyData>) => void,
  visibleColumns: string | any[],
  renderRowSubComponent: any
) {
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
    <TableBody {...getTableBodyProps()}>
      <Fragment>
        {rows.map((row, i) => {
          prepareRow(row);

          return (
            <>
              <StyledTableRow {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <TableCell {...cell.getCellProps()}>{cell.render("Cell")}</TableCell>;
                })}
              </StyledTableRow>
              {row.isExpanded ? (
                <StyledTableRow>
                  <TableCell colSpan={visibleColumns.length}>
                    {/*
                            Inside it, call our renderRowSubComponent function. In reality,
                            you could pass whatever you want as props to
                            a component like this, including the entire
                            table instance. But for this example, we'll just
                            pass the row
                          */}
                    {renderRowSubComponent({ row })}
                  </TableCell>
                </StyledTableRow>
              ) : null}
            </>
          );
        })}
      </Fragment>
    </TableBody>
  );
}

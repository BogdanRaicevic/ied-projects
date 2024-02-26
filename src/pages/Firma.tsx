import { MRT_Row, MaterialReactTable } from "material-react-table";
import { useLocation } from "react-router-dom";
import { myZaposleniColumns } from "../components/MyTable/myCompanyColumns";
import CompanyForm from "../components/Forms/CompanyForm";
import AttendedSeminarsAccordion from "../components/Accordion";
import { Company, Zaposleni } from "../schemas/companySchemas";
import PrijavaOdjava from "../components/PrijavaOdjava";
import { useState } from "react";
import { Tooltip, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ZaposleniDialog from "../components/Dialogs/ZaposleniDialog";

export default function Firma() {
  const location = useLocation();
  const [data, setData] = useState((location.state as Company) || {});
  const [selectedRow, setSelectedRow] = useState<MRT_Row<Zaposleni> | null>(null);

  const handleEdit = (row: MRT_Row<Zaposleni>) => {
    console.log("edit row", row);
    setSelectedRow(row); // Update the selected row data
    setOpen(true); // Open the dialog
  };

  const handleDelete = (row: MRT_Row<Zaposleni>) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      // deleteUser(row.original.id);
      console.log("deleted", row);
    }
  };

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const handleZaposleniSubmit = (zaposleniData: Zaposleni) => {
    console.log("this is zaposleni data", zaposleniData);
    setOpen(false);
  };

  // TODO: fix this to be like company table
  function renderZaposleniTable(): React.ReactNode {
    return (
      <MaterialReactTable
        columns={myZaposleniColumns}
        data={data?.zaposleni || []}
        enableColumnOrdering
        enableGlobalFilter={true}
        enableEditing={true}
        renderRowActions={({ row }) => (
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <Tooltip title="Edit">
              <IconButton onClick={() => handleEdit(row)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => handleDelete(row)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />
    );
  }

  function handlePrijavaChange(event: React.ChangeEvent<HTMLInputElement>) {
    setData((prevState) => ({ ...prevState, zeleMarketingMaterijal: event.target.checked }));
  }

  return (
    <>
      <h1>Firma: {data?.naziv}</h1>
      <PrijavaOdjava
        prijavljeniValue={data.zeleMarketingMaterijal}
        prijavaChange={handlePrijavaChange}
      ></PrijavaOdjava>
      <CompanyForm data={data}></CompanyForm>
      {renderZaposleniTable()}
      <ZaposleniDialog
        zaposleni={selectedRow?.original}
        open={open}
        onClose={handleClose}
        onSubmit={handleZaposleniSubmit}
      />
      <AttendedSeminarsAccordion firma={data}></AttendedSeminarsAccordion>
    </>
  );
}

import { MRT_Row, MaterialReactTable } from "material-react-table";
import { useLocation } from "react-router-dom";
import { myZaposleniColumns } from "../components/MyTable/myCompanyColumns";
import CompanyForm from "../components/Forms/CompanyForm";
import AttendedSeminarsAccordion from "../components/Accordion";
import { Company, Zaposleni } from "../schemas/companySchemas";
import PrijavaOdjava from "../components/PrijavaOdjava";
import { useEffect, useState } from "react";
import { Tooltip, IconButton, Button } from "@mui/material";
import { Box } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ZaposleniDialog from "../components/Dialogs/ZaposleniDialog";
import { useCompanyStore } from "../store";

const defaultCompanyData: Company = {
  zaposleni: [],
  zeleMarketingMaterijal: true,
  sajt: "",
  naziv: "",
  adresa: "",
  grad: "",
  opstina: "",
  pib: "",
  ptt: "",
  telefon: "",
  email: "",
  tip: "",
  velicina: "",
  stanje: "",
  odjava: false,
  komentari: "",
  seminari: [],
};

export default function Firma() {
  const location = useLocation();
  const { companiesData, updateCompany } = useCompanyStore();

  const [company, setCompany] = useState(
    companiesData.find((item) => item.id === location.state.id)
  );

  useEffect(() => {
    const company = companiesData.find((item) => item.id === location.state.id);
    if (company) {
      setCompany(company);
    }
  }, [companiesData, location.state.id]);

  const [selectedRow, setSelectedRow] = useState<MRT_Row<Zaposleni> | null>(null);

  const handleEdit = (row: MRT_Row<Zaposleni>) => {
    console.log("edit row", row.original);
    const updatedZaposleni = company?.zaposleni.map((zaposleni) =>
      zaposleni.id === row.original.id ? row.original : zaposleni
    );
    const updatedCompany: Company = {
      ...defaultCompanyData,
      ...company,
      zaposleni: updatedZaposleni || [], // Ensure zaposleni is always an array
    };
    updateCompany(company?.id!, updatedCompany);
    setSelectedRow(row);
    setOpen(true);
  };

  const handleDelete = (row: MRT_Row<Zaposleni>) => {
    const updatedCompany: Company = {
      ...defaultCompanyData,
      ...company,
      zaposleni: company?.zaposleni.filter((zaposleni) => zaposleni.id !== row.original.id) || [],
    };
    updateCompany(company?.id!, updatedCompany);
  };

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const handleZaposleniSubmit = (zaposleniData: Zaposleni) => {
    console.log("this is zaposleni data", zaposleniData);
    const updatedZaposleni = company?.zaposleni.map((zaposleni: Zaposleni) =>
      zaposleni.id === zaposleniData.id ? zaposleniData : zaposleni
    );
    const updatedCompany: Company = {
      ...defaultCompanyData,
      ...company,
      zaposleni: updatedZaposleni || [],
    };
    updateCompany(company?.id!, updatedCompany);
    setOpen(false);
  };

  // TODO: fix this to be like company table
  function renderZaposleniTable(): React.ReactNode {
    return (
      <MaterialReactTable
        columns={myZaposleniColumns}
        data={company?.zaposleni || []}
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
    // TODO: fix any
    setCompany((prevState: any) => ({
      ...prevState,
      zeleMarketingMaterijal: event.target.checked,
    }));
  }

  return (
    <>
      <h1>Firma: {company?.naziv}</h1>
      <PrijavaOdjava
        prijavljeniValue={company?.zeleMarketingMaterijal || true}
        prijavaChange={handlePrijavaChange}
      ></PrijavaOdjava>
      <CompanyForm data={company}></CompanyForm>
      <Button
        sx={{ my: 2 }}
        size="large"
        variant="contained"
        color="secondary"
        type="button"
        onClick={() => {
          setSelectedRow(null);
          setOpen(true);
        }}
      >
        Dodaj zaposlenog
      </Button>
      {renderZaposleniTable()}
      <ZaposleniDialog
        zaposleni={selectedRow?.original}
        open={open}
        onClose={handleClose}
        onSubmit={handleZaposleniSubmit}
      />
      <AttendedSeminarsAccordion firma={company as any}></AttendedSeminarsAccordion>
    </>
  );
}

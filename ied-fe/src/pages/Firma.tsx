import { MRT_Row, MaterialReactTable } from "material-react-table";
import { useParams } from "react-router-dom";
import { myZaposleniColumns } from "../components/MyTable/myCompanyColumns";
import CompanyForm from "../components/Forms/CompanyForm";
// import AttendedSeminarsAccordion from "../components/Accordion";
import { Company, Zaposleni } from "../schemas/companySchemas";
// import PrijavaOdjava from "../components/PrijavaOdjava";
import { useEffect, useState } from "react";
import { Tooltip, IconButton, Button } from "@mui/material";
import { Box } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ZaposleniDialog from "../components/Dialogs/ZaposleniDialog";
import { v4 } from "uuid";
import { fetchSingleFirmaData } from "../api/firma.api";

const defaultCompanyData: Company = {
  _id: "",
  ID_firma: 0,
  naziv_firme: "",
  adresa: "",
  telefon: "",
  e_mail: "",
  tip_firme: "",
  komentar: "",
  mesto: "",
  PIB: "",
  postanski_broj: "",
  zeleMarketingMaterijal: false,
  lastTouched: "",
  velicina: "",
  zaposleni: [],
  seminari: [],
  stanje_firme: "",
};

type TODO_ANY_TYPE = any;

export default function Firma() {
  // const location = useLocation();
  // const { companiesData, updateCompany } = useCompanyStore();
  const { id } = useParams();
  const [company, setCompany] = useState(defaultCompanyData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSingleFirmaData(String(id));
        if (data) {
          setCompany(data);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchData();
  }, [id]);

  const [selectedRow, setSelectedRow] = useState<MRT_Row<Zaposleni> | null>(null);

  const handleEdit = (row: MRT_Row<Zaposleni>) => {
    console.log("edit row", row.original);
    const updatedZaposleni = company?.zaposleni.map((zaposleni: TODO_ANY_TYPE) =>
      zaposleni._id === row.original._id ? row.original : zaposleni
    );
    const updatedCompany: Company = {
      ...defaultCompanyData,
      ...company,
      zaposleni: updatedZaposleni || [], // Ensure zaposleni is always an array
    };
    setCompany(updatedCompany);
    setSelectedRow(row);
    setOpen(true);
  };

  const handleDelete = (row: MRT_Row<Zaposleni>) => {
    const updatedCompany: Company = {
      ...defaultCompanyData,
      ...company,
      zaposleni:
        company?.zaposleni.filter(
          (zaposleni: TODO_ANY_TYPE) => zaposleni._id !== row.original._id
        ) || [],
    };
    setCompany(updatedCompany);
  };

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const handleZaposleniSubmit = (zaposleniData: Zaposleni) => {
    const existingZaposleni = company?.zaposleni.find(
      (zaposleni: Zaposleni) => zaposleni._id === zaposleniData._id
    );
    let updatedZaposleni;

    if (existingZaposleni) {
      // If the zaposleni exists, update it
      updatedZaposleni = company?.zaposleni.map((zaposleni: Zaposleni) => {
        if (zaposleni._id === zaposleniData._id) {
          return zaposleniData;
        }
        return zaposleni;
      });
    } else {
      // If the zaposleni doesn't exist, add it to the array
      const newZaposleni = { ...zaposleniData, id: v4() };
      console.log(" ja sam nov ------->", newZaposleni);
      updatedZaposleni = [...(company?.zaposleni || []), newZaposleni];
    }

    const updatedCompany: Company = {
      ...defaultCompanyData,
      ...company,
      zaposleni: updatedZaposleni || [],
    };

    setCompany(updatedCompany);
    setOpen(false);
  };

  // TODO: fix this to be like company table
  function renderZaposleniTable(): React.ReactNode {
    console.log("company in firma zaposleni table ,", company);
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

  // function handlePrijavaChange(event: React.ChangeEvent<HTMLInputElement>) {
  //   setCompany((prevState: TODO_ANY_TYPE) => ({
  //     ...prevState,
  //     zeleMarketingMaterijal: event.target.checked,
  //   }));
  // }

  return (
    <>
      <h1>Firma: {company?.naziv_firme}</h1>
      {/* <PrijavaOdjava
        prijavljeniValue={company?.zeleMarketingMaterijal || true}
        prijavaChange={handlePrijavaChange}
      ></PrijavaOdjava> */}
      <CompanyForm inputCompany={company}></CompanyForm>
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
      {/* <AttendedSeminarsAccordion firma={company satisfies Company}></AttendedSeminarsAccordion> */}
    </>
  );
}

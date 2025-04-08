import {
  type MRT_ColumnDef,
  type MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useParams } from "react-router-dom";
import { myZaposleniColumns } from "../components/MyTable/myCompanyColumns";
import FirmaForm from "../components/Forms/FirmaForm";
import type { FirmaType, Zaposleni } from "../schemas/firmaSchemas";
import { useEffect, useState, useMemo } from "react";
import { Tooltip, IconButton, Button, Alert } from "@mui/material";
import { Box } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ZaposleniDialog from "../components/Dialogs/ZaposleniDialog";
import { fetchSingleFirma, saveFirma } from "../api/firma.api";
import PrijavaNaSeminarDialog from "../components/Dialogs/PrijaviZaposlenogNaSeminar";

const defaultCompanyData: FirmaType = {
  ID_firma: 0,
  naziv_firme: "",
  adresa: "",
  telefon: "",
  e_mail: "",
  tip_firme: "",
  komentar: "",
  mesto: "",
  PIB: "",
  velicina_firme: "",
  zaposleni: [],
  stanje_firme: "",
  jbkjs: "",
  maticni_broj: "",
  delatnost: "",
};

type TODO_ANY_TYPE = any;

export default function Firma() {
  const { id } = useParams();
  const [company, setCompany] = useState(defaultCompanyData);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [warningAlert, setWarningAlert] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSingleFirma(String(id));
        if (data) {
          setCompany(data);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const [selectedRow, setSelectedRow] = useState<MRT_Row<Zaposleni> | null>(null);

  const handleEdit = (row: MRT_Row<Zaposleni>) => {
    setSelectedRow(row);
    setOpenZaposelniDialog(true);
  };

  const handleDelete = async (row: MRT_Row<Zaposleni>) => {
    const latestData = await fetchSingleFirma(String(id));
    if (!latestData) return;

    const filteredZaposleni = latestData.zaposleni.filter(
      (zaposleni: Zaposleni) => zaposleni._id !== row.original._id
    );

    const emailsMap = new Map<string, number>();
    filteredZaposleni
      .map((z) => z.e_mail)
      .filter(Boolean)
      .forEach((email) => {
        if (email && emailsMap.has(email)) {
          emailsMap.set(email, (emailsMap.get(email) || 0) + 1);
        } else if (email) {
          emailsMap.set(email, 0);
        }
      });

    const duplicates = new Map(Array.from(emailsMap).filter(([_key, value]) => value >= 1));

    if (duplicates.size > 0) {
      setWarningAlert(
        "Postoje zaposleni sa istom email adresom. ".concat(
          Array.from(duplicates.keys()).join(", ")
        )
      );
    }

    const updatedCompany: FirmaType = {
      ...latestData,
      zaposleni: filteredZaposleni,
    };
    setCompany(updatedCompany);

    if (duplicates.size > 0) {
      setTimeout(() => {
        setWarningAlert(null);
      }, 5000);
    }

    saveFirma({ _id: company?._id, zaposleni: filteredZaposleni });
  };

  const [openZaposleniDialog, setOpenZaposelniDialog] = useState(false);
  const [openPrijavaNaSeminarDialog, setOpenPrijavaNaSeminarDialog] = useState(false);
  const handleClosePrijavaDialog = () => setOpenPrijavaNaSeminarDialog(false);
  const handleClose = () => setOpenZaposelniDialog(false);

  const handleZaposleniSubmit = async (zaposleniData: Zaposleni) => {
    const isExistingCompany = !!company?._id;

    const employeeToAdd = zaposleniData._id
      ? zaposleniData
      : { ...zaposleniData, _id: `temp_${Date.now()}_${Math.random()}` };

    const existingZaposleni = company?.zaposleni.find(
      (zaposleni: Zaposleni) => zaposleni._id === employeeToAdd._id
    );

    let updatedZaposleni: any;

    if (existingZaposleni) {
      updatedZaposleni = company?.zaposleni.map((zaposleni: TODO_ANY_TYPE) =>
        zaposleni._id === employeeToAdd._id ? employeeToAdd : zaposleni
      );
    } else {
      updatedZaposleni = [...(company?.zaposleni || []), employeeToAdd];
    }

    const updatedCompany: FirmaType = {
      ...company,
      zaposleni: updatedZaposleni || [],
    };

    setCompany(updatedCompany);

    if (isExistingCompany) {
      try {
        const savedCompany = await saveFirma(updatedCompany);
        setCompany(savedCompany.data);
        setErrorAlert(null);
      } catch (error: any) {
        setCompany(company);
        setErrorAlert("Greška prilikom dodavanja zaposlenog. " + error.message);

        setTimeout(() => {
          setErrorAlert(null);
        }, 5000);
      }
    }

    setOpenZaposelniDialog(false);
  };

  const handlePrijaviNaSeminar = () => {
    setOpenPrijavaNaSeminarDialog(true);
  };

  const zapTable = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<Zaposleni>[]>(() => myZaposleniColumns, []),
    data: company?.zaposleni || [],
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableEditing: true,
    renderRowActions: ({ row }) => {
      return (
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Tooltip title="Prijavi na seminar" color="success">
            <IconButton
              onClick={() => {
                setSelectedRow(row);
                handlePrijaviNaSeminar();
              }}
            >
              <PersonAddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEdit(row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => {
                if (window.confirm("Da li ste sigurni da želite da obrišete zaposlenog?")) {
                  handleDelete(row);
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      },
    },
  });

  return (
    <>
      <h1>Firma: {company?.naziv_firme}</h1>

      <FirmaForm inputCompany={company} onSubmit={(updatedCompany) => setCompany(updatedCompany)} />
      <Button
        sx={{ my: 2 }}
        size="large"
        variant="contained"
        color="secondary"
        type="button"
        onClick={() => {
          setSelectedRow(null);
          setOpenZaposelniDialog(true);
        }}
      >
        Dodaj zaposlenog
      </Button>
      {errorAlert && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorAlert(null)}>
          {errorAlert}
        </Alert>
      )}
      {warningAlert && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setWarningAlert(null)}>
          {warningAlert}
        </Alert>
      )}
      <MaterialReactTable table={zapTable} />
      <ZaposleniDialog
        isCompanyBeingUpdated={Boolean(id)}
        zaposleni={selectedRow?.original}
        open={openZaposleniDialog}
        onClose={handleClose}
        onSubmit={handleZaposleniSubmit}
      />
      <PrijavaNaSeminarDialog
        open={openPrijavaNaSeminarDialog}
        onClose={handleClosePrijavaDialog}
        companyData={company}
        zaposleniData={selectedRow?.original ?? {}}
      />
    </>
  );
}

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { TODO_ANY } from "../../../ied-be/src/utils/utils";
import { saveFirma } from "../api/firma.api";
import PrijavaNaSeminarDialog from "../components/Dialogs/PrijaviZaposlenogNaSeminar";
import ZaposleniDialog from "../components/Dialogs/ZaposleniDialog";
import FirmaForm from "../components/Forms/FirmaForm";
import { myZaposleniColumns } from "../components/MyTable/myCompanyColumns";
import { useGetFirma } from "../hooks/firma/useFirmaQueries";
import type { FirmaType, Zaposleni } from "../schemas/firmaSchemas";

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

export default function Firma() {
  const { id } = useParams();
  const { data: firmaData, isLoading, isError, error } = useGetFirma(id);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [warningAlert, setWarningAlert] = useState<string | null>(null);

  const [selectedRow, setSelectedRow] = useState<MRT_Row<Zaposleni> | null>(
    null,
  );

  const handleEdit = (row: MRT_Row<Zaposleni>) => {
    setSelectedRow(row);
    setOpenZaposelniDialog(true);
  };

  const checkDuplicateEmails = (zaposleni: Zaposleni[]) => {
    const emailsMap = new Map<string, number>();
    zaposleni
      .map((z: Zaposleni) => z.e_mail)
      .filter(
        (email: string | undefined): email is string => email !== undefined,
      )
      .forEach((email: string) => {
        if (email && emailsMap.has(email)) {
          emailsMap.set(email, (emailsMap.get(email) || 0) + 1);
        } else if (email) {
          emailsMap.set(email, 0);
        }
      });

    const duplicates = new Map(
      Array.from(emailsMap).filter(([_key, value]) => value >= 1),
    );

    if (duplicates.size > 0) {
      setWarningAlert(
        "Postoje zaposleni sa istom email adresom. ".concat(
          Array.from(duplicates.keys()).join(", "),
        ),
      );
      setTimeout(() => {
        setWarningAlert(null);
      }, 5000);
    }
  };

  const handleDelete = async (row: MRT_Row<Zaposleni>) => {
    if (!firmaData) return;

    const filteredZaposleni = firmaData.zaposleni.filter(
      (zaposleni: Zaposleni) => zaposleni._id !== row.original._id,
    );

    checkDuplicateEmails(filteredZaposleni);

    const updatedCompany: FirmaType = {
      ...firmaData,
      zaposleni: filteredZaposleni,
    };
    // setCompany(updatedCompany);
    saveFirma({ _id: firmaData?._id, zaposleni: filteredZaposleni });
  };

  const [openZaposleniDialog, setOpenZaposelniDialog] = useState(false);
  const [openPrijavaNaSeminarDialog, setOpenPrijavaNaSeminarDialog] =
    useState(false);
  const handleClosePrijavaDialog = () => setOpenPrijavaNaSeminarDialog(false);
  const handleClose = () => setOpenZaposelniDialog(false);

  const handleZaposleniSubmit = async (zaposleniData: Zaposleni) => {
    if (!firmaData) {
      return;
    }
    const isExistingCompany = !!firmaData?._id;

    const employeeToAdd = zaposleniData._id
      ? zaposleniData
      : { ...zaposleniData, _id: `temp_${Date.now()}_${Math.random()}` };

    const existingZaposleni = firmaData?.zaposleni.find(
      (zaposleni: Zaposleni) => zaposleni._id === employeeToAdd._id,
    );

    let updatedZaposleni: any; // TODO: Define the type for updatedZaposleni

    if (existingZaposleni) {
      updatedZaposleni = firmaData?.zaposleni.map((zaposleni: TODO_ANY) =>
        zaposleni._id === employeeToAdd._id ? employeeToAdd : zaposleni,
      );
    } else {
      updatedZaposleni = [...(firmaData?.zaposleni || []), employeeToAdd];
    }

    checkDuplicateEmails(updatedZaposleni);

    const updatedCompany: FirmaType = {
      ...firmaData,
      zaposleni: updatedZaposleni || [],
    };

    // setCompany(updatedCompany);

    if (isExistingCompany) {
      try {
        const savedCompany = await saveFirma(updatedCompany);
        // setCompany(savedCompany.data);
        setErrorAlert(null);
      } catch (error: any) {
        // setCompany(firmaData);
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
    data: firmaData?.zaposleni || [],
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
                if (
                  window.confirm(
                    "Da li ste sigurni da želite da obrišete zaposlenog?",
                  )
                ) {
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
      columnPinning: {
        left: ["rowNumber", "actions"],
      },
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        Greška prilikom učitavanja podataka o firmi: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <h1>Firma: {firmaData?.naziv_firme}</h1>

      <FirmaForm
        inputCompany={firmaData || defaultCompanyData} // do we need default company data
        onSubmit={(updatedCompany) => {
          checkDuplicateEmails(updatedCompany.zaposleni);
          // setCompany(updatedCompany);
        }}
      />
      {firmaData?._id && (
        <>
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
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setErrorAlert(null)}
            >
              {errorAlert}
            </Alert>
          )}
          {warningAlert && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              onClose={() => setWarningAlert(null)}
            >
              {warningAlert}
            </Alert>
          )}
          <MaterialReactTable table={zapTable} />
          <ZaposleniDialog
            zaposleni={selectedRow?.original}
            open={openZaposleniDialog}
            onClose={handleClose}
            onSubmit={handleZaposleniSubmit}
          />
          <PrijavaNaSeminarDialog
            open={openPrijavaNaSeminarDialog}
            onClose={handleClosePrijavaDialog}
            companyData={firmaData}
            zaposleniData={selectedRow?.original ?? {}}
          />
        </>
      )}
    </>
  );
}

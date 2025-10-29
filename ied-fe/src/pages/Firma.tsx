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
import { format } from "date-fns/format";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  useMaterialReactTable,
} from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PrijavaNaSeminarDialog from "../components/Dialogs/PrijaviZaposlenogNaSeminar";
import ZaposleniDialog from "../components/Dialogs/ZaposleniDialog";
import FirmaForm from "../components/Forms/FirmaForm";
import { myZaposleniColumns } from "../components/MyTable/myCompanyColumns";
import {
  useAddZaposleni,
  useDeleteZaposleni,
  useUpdateFirma,
  useUpdateZaposleni,
} from "../hooks/firma/useFirmaMutations";
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

  const addZaposleniMutation = useAddZaposleni(id!);
  const updateZaposleniMutation = useUpdateZaposleni(id!);
  const deleteZaposleniMutation = useDeleteZaposleni(id!);
  const updateFirmaMutation = useUpdateFirma(id!);

  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [warningAlert, setWarningAlert] = useState<string | null>(null);

  const [selectedRow, setSelectedRow] = useState<MRT_Row<Zaposleni> | null>(
    null,
  );

  useEffect(() => {
    // Only run the check if we have employee data
    if (firmaData?.zaposleni && firmaData.zaposleni.length > 0) {
      const emailsMap = new Map<string, number>();
      firmaData.zaposleni
        .map((z: Zaposleni) => z.e_mail)
        .filter((email): email is string => !!email) // More concise filter
        .forEach((email: string) => {
          emailsMap.set(email, (emailsMap.get(email) || 0) + 1);
        });

      const duplicates = Array.from(emailsMap.entries())
        .filter(([, count]) => count > 1)
        .map(([email]) => email);

      if (duplicates.length > 0) {
        setWarningAlert(
          "Postoje zaposleni sa istom email adresom: ".concat(
            duplicates.join(", "),
          ),
        );
      } else {
        // Clear the warning if no duplicates are found
        setWarningAlert(null);
      }
    }
  }, [firmaData?.zaposleni]);

  const handleEdit = (row: MRT_Row<Zaposleni>) => {
    setSelectedRow(row);
    setOpenZaposelniDialog(true);
  };

  const handleDeleteZaposleni = async (row: MRT_Row<Zaposleni>) => {
    deleteZaposleniMutation.mutate(row.original._id);
  };

  const [openZaposleniDialog, setOpenZaposelniDialog] = useState(false);
  const [openPrijavaNaSeminarDialog, setOpenPrijavaNaSeminarDialog] =
    useState(false);
  const handleClosePrijavaDialog = () => setOpenPrijavaNaSeminarDialog(false);
  const handleClose = () => setOpenZaposelniDialog(false);
  const handlePrijavaSuccess = (seminar: string) => {
    if (selectedRow) {
      const zaposleni = selectedRow.original;
      const newKomentar = `${firmaData?.komentar || ""}\n${format(Date(), "dd.MM.yyyy")} - ${zaposleni.ime} ${zaposleni.prezime} - ${seminar}`;
      updateFirmaMutation.mutate({ ...firmaData, komentar: `${newKomentar}` });
    }
    handleClosePrijavaDialog();
  };

  const handleZaposleniSubmit = (zaposleniData: Zaposleni) => {
    const isEditing = !!zaposleniData._id;

    if (isEditing) {
      // We are updating an existing employee
      updateZaposleniMutation.mutate(zaposleniData, {
        onSuccess: () => {
          setOpenZaposelniDialog(false); // Close dialog on success
        },
        onError: (error) => {
          // The hook handles the optimistic rollback. We can show an alert.
          setErrorAlert(
            `Greška prilikom ažuriranja zaposlenog: ${error.message}`,
          );
        },
      });
    } else {
      // We are adding a new employee
      // The backend will assign the _id, so we don't send one.
      const { _id, ...newZaposleniData } = zaposleniData;
      addZaposleniMutation.mutate(newZaposleniData, {
        onSuccess: () => {
          setOpenZaposelniDialog(false); // Close dialog on success
        },
        onError: (error) => {
          setErrorAlert(
            `Greška prilikom dodavanja zaposlenog: ${error.message}`,
          );
        },
      });
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
                  handleDeleteZaposleni(row);
                }
              }}
              disabled={
                deleteZaposleniMutation.isPending &&
                deleteZaposleniMutation.variables === row.original._id
              }
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
            onSuccess={handlePrijavaSuccess}
          />
        </>
      )}
    </>
  );
}

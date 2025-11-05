import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { format } from "date-fns/format";
import type { FirmaType, ZaposleniType } from "ied-shared";
import type { MRT_Row } from "material-react-table";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PrijavaNaSeminarDialog from "../components/Dialogs/PrijaviZaposlenogNaSeminar";
import ZaposleniDialog from "../components/Dialogs/ZaposleniDialog";
import { ZaposleniTable } from "../components/FirmasTable";
import FirmaForm from "../components/Forms/FirmaForm";
import {
  useAddZaposleni,
  useDeleteZaposleni,
  useUpdateFirma,
  useUpdateZaposleni,
} from "../hooks/firma/useFirmaMutations";
import { useGetFirma } from "../hooks/firma/useFirmaQueries";

const defaultFirmaData: FirmaType = {
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
  prijavljeni: true,
};

const defaultZaposleniData: ZaposleniType = {
  ime: "",
  prezime: "",
  e_mail: "",
  telefon: "",
  komentar: "",
  radno_mesto: "",
  prijavljeni: true,
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

  const [selectedRow, setSelectedRow] = useState<MRT_Row<ZaposleniType> | null>(
    null,
  );

  useEffect(() => {
    // Only run the check if we have employee data
    if (firmaData?.zaposleni && firmaData.zaposleni.length > 0) {
      const emailsMap = new Map<string, number>();
      firmaData.zaposleni
        .map((z: ZaposleniType) => z.e_mail)
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

  const handleEdit = (row: MRT_Row<ZaposleniType>) => {
    setSelectedRow(row);
    setOpenZaposelniDialog(true);
  };

  const handleDeleteZaposleni = async (row: MRT_Row<ZaposleniType>) => {
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

      const imePrezime =
        `${zaposleni.ime || ""} ${zaposleni.prezime || ""}`.trim();
      const prijavaKomentar = `\n${format(Date(), "dd.MM.yyyy")} - ${imePrezime} - ${seminar} - PRIJAVA`;
      const newFirmaKomentar = `${firmaData?.komentar || ""}${prijavaKomentar}`;
      updateFirmaMutation.mutate({
        ...firmaData,
        komentar: `${newFirmaKomentar}`,
      });

      const newZaposleniKomentar = `${zaposleni.komentar || ""}${prijavaKomentar}`;
      updateZaposleniMutation.mutate({
        ...zaposleni,
        komentar: `${newZaposleniKomentar}`,
      });
    }
    handleClosePrijavaDialog();
  };

  const handleZaposleniSubmit = (zaposleniData: ZaposleniType) => {
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
        inputCompany={firmaData || defaultFirmaData} // do we need default company data
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
          <ZaposleniTable
            zaposleni={firmaData?.zaposleni || []}
            onEdit={handleEdit}
            onDelete={handleDeleteZaposleni}
            onPrijaviNaSeminar={(row) => {
              setSelectedRow(row);
              handlePrijaviNaSeminar();
            }}
            isDeleting={deleteZaposleniMutation.isPending}
            deletingZaposleniId={deleteZaposleniMutation.variables}
          />
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
            zaposleniData={selectedRow?.original ?? defaultZaposleniData}
            onSuccess={handlePrijavaSuccess}
          />
        </>
      )}
    </>
  );
}

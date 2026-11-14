import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import type { SeminarZodType } from "ied-shared";
import { memo, useMemo, useState } from "react";
import {
  useDeleteSeminarMutation,
  useGenerateSertifikatiMutation,
} from "../../hooks/seminar/useSeminarMutations";
import {
  buildBatchSertifikati,
  getCertificateWarning,
} from "../../utils/certificate";
import CertificateNumberDialog, {
  type CertificateDialogSubmitValues,
} from "./CertificateNumberDialog";

const exportDataToCSV = async (
  seminar: Partial<SeminarZodType>,
  exportSubject: "seminar" | "klijenti",
  csvData: string,
) => {
  try {
    // Prepend BOM for Excel to recognize UTF-8 encoding of special Serbian characters
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvData], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${seminar.naziv}-${exportSubject}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    // TODO: show error snackbar or toast
    console.error("Error exporting data:", error);
  }
};

const SeminariTableActionCell = memo(
  ({
    seminar,
    onEdit,
  }: {
    seminar: Partial<SeminarZodType>;
    onEdit: (seminar: Partial<SeminarZodType>) => void;
  }) => {
    const deleteSeminarMutation = useDeleteSeminarMutation();
    const [isCertificateDialogOpen, setIsCertificateDialogOpen] =
      useState(false);
    const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
    // Local validation message; server errors come from the mutation.
    const [submitError, setSubmitError] = useState<string | null>(null);
    const generateSertifikati = useGenerateSertifikatiMutation();
    const errorMessage =
      submitError ??
      (generateSertifikati.error
        ? generateSertifikati.error.message ||
          "Došlo je do greške prilikom generisanja sertifikata."
        : null);
    const clearErrors = () => {
      setSubmitError(null);
      generateSertifikati.reset();
    };

    const closeSpeedDial = () => setIsSpeedDialOpen(false);
    const openSpeedDial = () => setIsSpeedDialOpen(true);

    const handleDelete = async (id: string) => {
      if (window.confirm("Da li ste sigurni da želite da obrišete seminar?")) {
        await deleteSeminarMutation.mutateAsync(id);
      }
    };

    const handleExportUcesnikaSeminara = (seminar: Partial<SeminarZodType>) => {
      let csv = "Redni Broj, Naziv firme, Ime i Prezime, Email\n";
      const data = seminar.prijave
        ?.map(
          (p, index) =>
            `${index + 1},${p.firma_naziv},${p.zaposleni_ime} ${p.zaposleni_prezime},${p.zaposleni_email}`,
        )
        .join("\n");

      csv += data;
      exportDataToCSV(seminar, "klijenti", csv);
    };

    const handleExportSeminarTable = (seminar: Partial<SeminarZodType>) => {
      const csvRows: string =
        `${seminar.naziv}\n` +
        "Redni Broj, Naziv firme, Ime i Prezime, Email\n" +
        seminar.prijave
          ?.map((p, index) => {
            return `${index + 1}, ${p.firma_naziv},${p.zaposleni_ime} ${p.zaposleni_prezime},${p.zaposleni_email}`;
          })
          .join("\n");

      exportDataToCSV(seminar, "seminar", csvRows);
    };

    const dialogMessages = useMemo(() => {
      const messages: string[] = [];

      if (!seminar.prijave?.length) {
        messages.push(
          "Nema prijava za seminar. Sertifikati ne mogu biti generisani.",
        );
      }

      if (!seminar.naziv) {
        messages.push(
          "Naziv seminara nije validan. Sertifikati ne mogu biti generisani.",
        );
      }

      if (!seminar.datumi?.length) {
        messages.push(
          "Datum seminara nije validan. Sertifikati ne mogu biti generisani.",
        );
      }

      const warningMessages = (seminar.prijave || [])
        .map((prijava) => getCertificateWarning(prijava))
        .filter((message): message is string => Boolean(message));

      if (warningMessages.length > 0) {
        messages.push(
          "Za navedene korisnike nije bilo moguće generisati sertifikat:",
        );
        messages.push(...warningMessages);
      }

      if (
        seminar.prijave?.length &&
        warningMessages.length === seminar.prijave.length
      ) {
        messages.unshift(
          "Za nijednog prijavljenog korisnika nije moguće generisati sertifikat.",
        );
      }

      if (errorMessage) {
        messages.unshift(errorMessage);
      }

      return messages;
    }, [seminar.datumi, seminar.naziv, seminar.prijave, errorMessage]);

    const disableDialogConfirm = useMemo(() => {
      if (
        !seminar.prijave?.length ||
        !seminar.naziv ||
        !seminar.datumi?.length
      ) {
        return true;
      }

      const invalidCount = (seminar.prijave || []).filter((prijava) =>
        Boolean(getCertificateWarning(prijava)),
      ).length;

      return invalidCount === seminar.prijave.length;
    }, [seminar.datumi, seminar.naziv, seminar.prijave]);

    const handleOpenCertificateDialog = () => {
      clearErrors();
      setIsCertificateDialogOpen(true);
    };

    const handleCloseCertificateDialog = () => {
      if (generateSertifikati.isPending) {
        return;
      }

      clearErrors();
      setIsCertificateDialogOpen(false);
    };

    const handleGenerateCertificates = ({
      certificateNumber,
      templateKey,
    }: CertificateDialogSubmitValues) => {
      const datumi = seminar.datumi ?? [];
      if (!seminar.prijave?.length || !seminar.naziv || datumi.length === 0) {
        return;
      }

      const { sertifikati } = buildBatchSertifikati(
        seminar.prijave,
        certificateNumber,
        seminar.naziv,
        datumi,
        templateKey,
      );

      if (sertifikati.length === 0) {
        setSubmitError(
          "Nije moguće generisati nijedan sertifikat za izabrani seminar.",
        );
        return;
      }

      setSubmitError(null);
      generateSertifikati.mutate(sertifikati, {
        onSuccess: () => setIsCertificateDialogOpen(false),
      });
    };

    const speedDialActions = [
      {
        icon: <EditIcon color="info" />,
        name: "Izmeni",
        onClick: () => onEdit(seminar),
      },
      {
        icon: <PictureAsPdfIcon color="secondary" />,
        name: "Generiši PDF sertifikate",
        onClick: handleOpenCertificateDialog,
      },
      {
        icon: <ForwardToInboxIcon color="secondary" />,
        name: "Export učesnika",
        onClick: () => handleExportUcesnikaSeminara(seminar),
      },
      {
        icon: <TableViewIcon color="secondary" />,
        name: "Export tabele",
        onClick: () => handleExportSeminarTable(seminar),
      },
      {
        icon: <DeleteIcon color="error" />,
        name: "Obriši",
        onClick: () => seminar._id && handleDelete(seminar._id),
      },
    ];

    return (
      <Box sx={{ position: "relative", height: 50, width: 50 }}>
        <SpeedDial
          ariaLabel="Akcije za seminar"
          direction="right"
          icon={<SpeedDialIcon />}
          open={isSpeedDialOpen}
          onOpen={openSpeedDial}
          onClose={closeSpeedDial}
          FabProps={{ size: "small" }}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            "& .MuiSpeedDial-actions": {
              alignItems: "center",
              backgroundColor: "rgba(33, 33, 33, 0.94)",
              borderRadius: 999,
            },
            "& .MuiSpeedDial-actionsClosed": {
              backgroundColor: "transparent",
            },
          }}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              slotProps={{
                tooltip: {
                  title: action.name,
                },
              }}
              onClick={() => {
                closeSpeedDial();
                action.onClick();
              }}
            />
          ))}
        </SpeedDial>
        <CertificateNumberDialog
          open={isCertificateDialogOpen}
          title="Postavi početni broj za PDF sertifikate"
          description="Unesite broj od kog kreće numeracija sertifikata za validne prijave. Izvoz će biti ZIP PDF fajlova."
          inputLabel="Početni broj sertifikata"
          alertMessages={dialogMessages}
          alertSeverity={
            disableDialogConfirm || errorMessage ? "error" : "warning"
          }
          disableConfirm={disableDialogConfirm}
          isSubmitting={generateSertifikati.isPending}
          onClose={handleCloseCertificateDialog}
          onConfirm={handleGenerateCertificates}
        />
      </Box>
    );
  },
);

export default SeminariTableActionCell;

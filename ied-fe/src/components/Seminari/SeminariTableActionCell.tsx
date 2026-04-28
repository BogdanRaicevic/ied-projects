import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { IconButton, Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import type { SeminarZodType } from "ied-shared";
import { memo, useMemo, useState } from "react";
import {
  generateSertifikatDocument,
  generateSertifikatPdfDocument,
} from "../../api/docx.api";
import { useDeleteSeminarMutation } from "../../hooks/seminar/useSeminarMutations";
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
    const [certificateExportFormat, setCertificateExportFormat] = useState<
      "docx" | "pdf"
    >("docx");
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (!seminar.datum) {
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

      if (submitError) {
        messages.unshift(submitError);
      }

      return messages;
    }, [seminar.datum, seminar.naziv, seminar.prijave, submitError]);

    const disableDialogConfirm = useMemo(() => {
      if (!seminar.prijave?.length || !seminar.naziv || !seminar.datum) {
        return true;
      }

      const invalidCount = (seminar.prijave || []).filter((prijava) =>
        Boolean(getCertificateWarning(prijava)),
      ).length;

      return invalidCount === seminar.prijave.length;
    }, [seminar.datum, seminar.naziv, seminar.prijave]);

    const handleOpenCertificateDialog = (format: "docx" | "pdf") => {
      setCertificateExportFormat(format);
      setSubmitError(null);
      setIsCertificateDialogOpen(true);
    };

    const handleCloseCertificateDialog = () => {
      if (isSubmitting) {
        return;
      }

      setSubmitError(null);
      setIsCertificateDialogOpen(false);
    };

    const handleGenerateCertificates = async ({
      certificateNumber,
      templateKey,
    }: CertificateDialogSubmitValues) => {
      if (!seminar.prijave?.length || !seminar.naziv || !seminar.datum) {
        return;
      }

      const { sertifikati } = buildBatchSertifikati(
        seminar.prijave,
        certificateNumber,
        seminar.naziv,
        seminar.datum,
        templateKey,
      );

      if (sertifikati.length === 0) {
        setSubmitError(
          "Nije moguće generisati nijedan sertifikat za izabrani seminar.",
        );
        return;
      }

      try {
        setIsSubmitting(true);
        setSubmitError(null);
        if (certificateExportFormat === "pdf") {
          await generateSertifikatPdfDocument(sertifikati);
        } else {
          await generateSertifikatDocument(sertifikati);
        }
        setIsCertificateDialogOpen(false);
      } catch (error) {
        console.error("Error generating certificates:", error);
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Došlo je do greške prilikom generisanja sertifikata.",
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton color="info" onClick={() => onEdit(seminar)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Generiši DOCX sertifikate">
          <IconButton
            color="success"
            onClick={() => handleOpenCertificateDialog("docx")}
          >
            <WorkspacePremiumIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Generiši PDF sertifikate">
          <IconButton
            color="secondary"
            onClick={() => handleOpenCertificateDialog("pdf")}
          >
            <PictureAsPdfIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Export učesnika">
          <IconButton
            color="secondary"
            onClick={() => handleExportUcesnikaSeminara(seminar)}
          >
            <ForwardToInboxIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Export tabele">
          <IconButton
            color="secondary"
            onClick={() => handleExportSeminarTable(seminar)}
          >
            <TableViewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() => handleDelete(seminar._id || "")}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <CertificateNumberDialog
          open={isCertificateDialogOpen}
          title={`Postavi početni broj za ${certificateExportFormat.toUpperCase()} sertifikate`}
          description={`Unesite broj od kog kreće numeracija sertifikata za validne prijave. Izvoz će biti ZIP ${certificateExportFormat.toUpperCase()} fajlova.`}
          inputLabel="Početni broj sertifikata"
          alertMessages={dialogMessages}
          alertSeverity={
            disableDialogConfirm || submitError ? "error" : "warning"
          }
          disableConfirm={disableDialogConfirm}
          isSubmitting={isSubmitting}
          onClose={handleCloseCertificateDialog}
          onConfirm={handleGenerateCertificates}
        />
      </Box>
    );
  },
);

export default SeminariTableActionCell;

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import TableViewIcon from "@mui/icons-material/TableView";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { IconButton, Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import { formatDate } from "date-fns";
import { srLatn } from "date-fns/locale";
import type { SeminarZodType } from "ied-shared";
import { memo } from "react";
import {
  generateSertifikatDocument,
  type SertifikatDocumentRequest,
} from "../../api/docx.api";
import { useDeleteSeminarMutation } from "../../hooks/seminar/useSeminarMutations";

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

    const handleGenerateCertificates = async (
      seminar: Partial<SeminarZodType>,
    ) => {
      const errors: string[] = [];
      if (!seminar.prijave) {
        alert("Nema prijava za seminar. Sertifikati ne mogu biti generisani.");
        return;
      }
      if (!seminar.naziv) {
        alert(
          "Naziv seminara nije validan. Sertifikati ne mogu biti generisani.",
        );
        return;
      }
      if (!seminar.datum) {
        alert(
          "Datum seminara nije validan. Sertifikati ne mogu biti generisani.",
        );
        return;
      }

      const seminarName = seminar.naziv;
      const seminarDate = seminar.datum;

      const startingNumberInput = window.prompt(
        "Unesite početni broj sertifikata:",
      );
      if (startingNumberInput === null) {
        return;
      }

      const startingCertificateNumber = Number.parseInt(
        startingNumberInput.trim(),
        10,
      );

      if (
        !Number.isInteger(startingCertificateNumber) ||
        startingCertificateNumber <= 0
      ) {
        alert("Početni broj sertifikata mora biti pozitivan ceo broj.");
        return;
      }

      const sertifikatData: SertifikatDocumentRequest[] =
        seminar.prijave?.reduce(
          (acc, p) => {
            const ime_prezime =
              `${p.zaposleni_ime} ${p.zaposleni_prezime}`.trim();
            const nameParts = ime_prezime.split(" ");

            if (nameParts.length <= 1) {
              errors.push(
                `Ime i prezime nisu validni za firmu: ${p.firma_naziv}`,
              );
              return acc;
            }
            if (!p.firma_naziv?.trim()) {
              errors.push(`Naziv firme nije validan za korisnika: ${ime_prezime}`);
              return acc;
            }
            acc.push({
              sertifikat_broj: startingCertificateNumber + acc.length,
              firma_naziv: p.firma_naziv.trim(),
              ime_prezime,
              seminar_naziv: seminarName,
              datum_seminara: formatDate(seminarDate, "dd. MMMM yyyy.", {
                locale: srLatn,
              }),
              godina_seminara: formatDate(seminarDate, "yyyy", {
                locale: srLatn,
              }),
            });
            return acc;
          },
          [] as SertifikatDocumentRequest[],
        ) || [];

      if (errors.length > 0) {
        alert(
          "Greška pri generisanju sertifikata.\nZa sledeće klijente nisu generisani sertifikati:\n" +
            errors.join("\n"),
        );
      }

      if (sertifikatData.length === 0) {
        return;
      }

      try {
        await generateSertifikatDocument(sertifikatData);
      } catch (error) {
        console.error("Error generating certificates:", error);
        alert("Došlo je do greške prilikom generisanja sertifikata.");
      }
    };

    return (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton color="info" onClick={() => onEdit(seminar)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Generiši sertifikate">
          <IconButton
            color="success"
            onClick={() => handleGenerateCertificates(seminar)}
          >
            <WorkspacePremiumIcon />
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
      </Box>
    );
  },
);

export default SeminariTableActionCell;

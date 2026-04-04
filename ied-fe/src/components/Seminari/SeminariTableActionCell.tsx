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

    const handleGenerateCertificates = (seminar: Partial<SeminarZodType>) => {
      const errors: string[] = [];
      const sertifikatData = {
        prijave:
          seminar.prijave?.reduce(
            (acc, p) => {
              const s = {
                ime_prezime: `${p.zaposleni_ime} ${p.zaposleni_prezime}`,
                naziv_seminara: seminar.naziv,
                datum: formatDate(seminar.datum!, "dd. MMMM yyyy.", {
                  locale: srLatn,
                }),
                godina: formatDate(seminar.datum!, "yyyy", { locale: srLatn }),
              };

              const nameParts = s.ime_prezime.trim().split(" ");
              if (nameParts.length <= 1) {
                errors.push(
                  `Ime i prezime nisu validni za firmu: ${p.firma_naziv}`,
                );
                return acc;
              }

              acc.push(s);
              return acc;
            },
            [] as Array<{
              ime_prezime: string;
              naziv_seminara: string | undefined;
              datum: string;
              godina: string;
            }>,
          ) || [],
      };

      if (errors.length > 0) {
        alert(
          "Greška pri generisanju sertifikata.\nZa sledeće klijente nisu generisani sertifikati:\n" +
            errors.join("\n"),
        );
      }

      return sertifikatData;
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

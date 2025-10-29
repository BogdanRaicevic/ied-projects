import type {
  ExportFirma,
  ExportZaposlenih,
  FirmaQueryParams,
} from "@ied-shared/index";
import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import { exportFirmaData, exportZaposleniData } from "../../api/firma.api";

type SaveButton = {
  queryParameters: FirmaQueryParams;
  fileName: string;
  exportSubject: "firma" | "zaposleni";
};

export default function ExportDataButton({
  queryParameters,
  fileName,
  exportSubject,
}: SaveButton) {
  // Prepend BOM to preserve Serbian Latin characters in Windows
  const bom = "\uFEFF";

  const firmaData = (someData: { data: ExportFirma; duplicates: string[] }) => {
    const headers = ["Naziv firme", "E-mail", "Delatnost", "Tip firme"];

    const rows = someData.data.map((item) => [
      item.naziv_firme || "",
      item.e_mail || "",
      item.delatnost || "",
      item.tip_firme || "",
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const headersForDuplicates = "Duplicate E-mails";
    const duplicatesContent = someData.duplicates.length
      ? [headersForDuplicates, ...someData.duplicates].join("\n")
      : "";

    return `${bom + csvContent}\n\n${duplicatesContent}`;
  };

  const zaposleniData = (someData: {
    data: ExportZaposlenih;
    duplicates: string[];
  }) => {
    const headers = ["Ime i prezime", "E-mail", "Naziv firme", "Radno mesto"];

    const rows = someData.data.map((item) => [
      item.imePrezime || "",
      item.e_mail || "",
      item.naziv_firme || "",
      item.radno_mesto || "",
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const headersForDuplicates = "Duplicate E-mails";
    const duplicatesContent = someData.duplicates.length
      ? [headersForDuplicates, ...someData.duplicates].join("\n")
      : "";

    return `${bom + csvContent}\n\n${duplicatesContent}`;
  };

  const handleExport = async () => {
    try {
      const data =
        exportSubject === "firma"
          ? await exportFirmaData(queryParameters)
          : await exportZaposleniData(queryParameters);

      const csvData =
        exportSubject === "firma" ? firmaData(data) : zaposleniData(data);

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  return (
    <Button
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      variant="contained"
      sx={{ m: 1 }}
      size="large"
      color="info"
    >
      Export {exportSubject}
    </Button>
  );
}

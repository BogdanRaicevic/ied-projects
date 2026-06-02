import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import type {
  ExportFirma,
  ExportZaposlenih,
  ParametriPretrage,
} from "ied-shared";
import { exportFirmaData, exportZaposleniData } from "../../api/firma.api";

type SaveButton = {
  queryParameters: ParametriPretrage;
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

  // RFC 4180: quote a field only when it contains a comma, double quote, or
  // newline, and escape any embedded double quotes by doubling them.
  const escapeCsvField = (field: string) => {
    if (/[",\r\n]/.test(field)) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const buildCsv = (rows: string[][]) =>
    bom +
    rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");

  const firmaData = (someData: ExportFirma) => {
    const headers = ["Name", "Email"];
    const rows = someData.map((item) => [item.naziv_firme || "", item.e_mail]);

    return buildCsv([headers, ...rows]);
  };

  const zaposleniData = (someData: ExportZaposlenih) => {
    const headers = ["Name", "Email"];
    const rows = someData.map((item) => [item.imePrezime || "", item.e_mail]);

    return buildCsv([headers, ...rows]);
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

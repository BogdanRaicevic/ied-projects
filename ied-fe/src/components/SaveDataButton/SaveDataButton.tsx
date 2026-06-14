import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import { strToU8, zipSync } from "fflate";
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

// Common shape so firma/zaposleni rows can share the partitioning logic.
type NormalizedRow = {
  name: string;
  email: string;
  firmaNaziv: string;
  imePrezime: string;
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
    bom + rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");

  const normalizeFirma = (someData: ExportFirma): NormalizedRow[] =>
    someData.map((item) => ({
      name: item.naziv_firme || "",
      email: item.e_mail || "",
      firmaNaziv: item.naziv_firme || "",
      imePrezime: "",
    }));

  const normalizeZaposleni = (someData: ExportZaposlenih): NormalizedRow[] =>
    someData.map((item) => ({
      name: item.imePrezime || "",
      email: item.e_mail || "",
      firmaNaziv: item.firma_naziv || "",
      imePrezime: item.imePrezime || "",
    }));

  // Split rows into: deduplicated upload rows (first email wins), the dropped
  // duplicate occurrences, and rows that have no email at all.
  const partitionRows = (rows: NormalizedRow[]) => {
    const seenEmails = new Set<string>();
    const upload: NormalizedRow[] = [];
    const duplicates: NormalizedRow[] = [];
    const noEmail: NormalizedRow[] = [];

    for (const row of rows) {
      const normalizedEmail = row.email.trim().toLowerCase();

      if (!normalizedEmail) {
        noEmail.push(row);
        continue;
      }

      if (seenEmails.has(normalizedEmail)) {
        duplicates.push(row);
        continue;
      }

      seenEmails.add(normalizedEmail);
      upload.push(row);
    }

    return { upload, duplicates, noEmail };
  };

  const buildUploadCsv = (rows: NormalizedRow[]) =>
    buildCsv([["Name", "Email"], ...rows.map((row) => [row.name, row.email])]);

  const buildDuplicatesCsv = (rows: NormalizedRow[]) => {
    if (exportSubject === "firma") {
      return buildCsv([
        ["firma_naziv", "email"],
        ...rows.map((row) => [row.firmaNaziv, row.email]),
      ]);
    }

    return buildCsv([
      ["firma_naziv", "email", "ime_prezime"],
      ...rows.map((row) => [row.firmaNaziv, row.email, row.imePrezime]),
    ]);
  };

  const buildNoEmailCsv = (rows: NormalizedRow[]) => {
    if (exportSubject === "firma") {
      return buildCsv([
        ["firma_naziv"],
        ...rows.map((row) => [row.firmaNaziv]),
      ]);
    }

    return buildCsv([
      ["firma_naziv", "ime_prezime"],
      ...rows.map((row) => [row.firmaNaziv, row.imePrezime]),
    ]);
  };

  const downloadZip = (zipped: Uint8Array) => {
    // Copy into a fresh ArrayBuffer so the Blob part is typed as ArrayBuffer
    // (fflate returns Uint8Array<ArrayBufferLike>, which TS rejects directly).
    const buffer = new ArrayBuffer(zipped.byteLength);
    new Uint8Array(buffer).set(zipped);
    const blob = new Blob([buffer], { type: "application/zip" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      const rows =
        exportSubject === "firma"
          ? normalizeFirma(await exportFirmaData(queryParameters))
          : normalizeZaposleni(await exportZaposleniData(queryParameters));

      const { upload, duplicates, noEmail } = partitionRows(rows);

      const zipped = zipSync({
        [`${fileName}_upload.csv`]: strToU8(buildUploadCsv(upload)),
        [`${fileName}_duplikati.csv`]: strToU8(buildDuplicatesCsv(duplicates)),
        [`${fileName}_bez_emaila.csv`]: strToU8(buildNoEmailCsv(noEmail)),
      });

      downloadZip(zipped);
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

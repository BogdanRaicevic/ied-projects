import fs from "node:fs";
import path from "node:path";
import { formatDate } from "date-fns";

export const sanitizeFilename = (str: string): string => {
  if (str.length > 255) {
    throw new Error("Filename is too long");
  }
  const serbianChars: { [key: string]: string } = {
    š: "s",
    Š: "S",
    đ: "dj",
    Đ: "Dj",
    č: "c",
    Č: "C",
    ć: "c",
    Ć: "C",
    ž: "z",
    Ž: "Z",
  };
  let sanitized = str.replace(
    /[šŠđĐčČćĆžŽ]/g,
    (char) => serbianChars[char] || char,
  );
  sanitized = sanitized.replace(/[^a-zA-Z0-9-_.]/g, "_");
  sanitized = sanitized.replace(/_+/g, "_");
  sanitized = sanitized.replace(/\.+(?=\.)/g, "");
  return sanitized;
};

export const formatToLocalDate = (date: Date): string =>
  formatDate(date, "dd.MM.yyyy");

export const getTemplateErrorDetails = (error: unknown): string => {
  let errorDetails = error instanceof Error ? error.message : "Unknown error";
  if (error && typeof error === "object" && "properties" in error) {
    const err = error as {
      properties?: {
        errors?: Array<{
          name?: string;
          message?: string;
          properties?: { id?: string };
        }>;
      };
    };
    if (err.properties?.errors) {
      errorDetails = err.properties.errors
        .map(
          (e) =>
            `${e.name || "Error"}: ${e.message || ""} (${e.properties?.id || "unknown"})`,
        )
        .join("; ");
    }
  }
  return errorDetails;
};

export const getCurrentYearLastTwoDigits = (): string =>
  String(new Date().getFullYear()).slice(-2);

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const mimeTypeForExt: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  gif: "image/gif",
  webp: "image/webp",
};

export const inlineLocalAsset = (assetPath: string): string | null => {
  if (!fs.existsSync(assetPath)) return null;
  const ext = path.extname(assetPath).toLowerCase().slice(1);
  const mime = mimeTypeForExt[ext] ?? "application/octet-stream";
  const base64 = fs.readFileSync(assetPath).toString("base64");
  return `data:${mime};base64,${base64}`;
};

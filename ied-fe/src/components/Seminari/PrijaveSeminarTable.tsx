import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { formatDate } from "date-fns";
import { srLatn } from "date-fns/locale";
import type { PrijavaZodType, SertifikatType } from "ied-shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateSingleSertifikatDocument } from "../../api/docx.api";
import { useDeletePrijavaMutation } from "../../hooks/seminar/useSeminarMutations";

export default function PrijaveSeminarTable({
  seminarId,
  seminarDate,
  seminarName,
  prijave,
}: {
  seminarId: string;
  seminarDate: Date;
  seminarName: string;
  prijave: PrijavaZodType[];
}) {
  const [open, setOpen] = useState(false);

  const deletePrijava = useDeletePrijavaMutation();

  const onPrijavaDelete = async (zaposleni_id: string, seminar_id: string) => {
    const confirmed = window.confirm(
      "Da li ste sigurni da želite da obrišete prijavu?",
    );
    if (confirmed) {
      await deletePrijava.mutateAsync({
        zaposleniId: zaposleni_id,
        seminarId: seminar_id,
      });
    }
  };

  const navigate = useNavigate();
  const handleCreateRacun = () => {
    navigate("/racuni", { state: { prijave, seminarId } });
  };

  const handleGenerateSingleCertificate = async (prijava: PrijavaZodType) => {
    const ime_prezime =
      `${prijava.zaposleni_ime || ""} ${prijava.zaposleni_prezime || ""}`.trim();
    const nameParts = ime_prezime.split(" ").filter(Boolean);

    if (nameParts.length <= 1) {
      alert(
        `Ime i prezime nisu validni za firmu: ${prijava.firma_naziv || "Nepoznata firma"}`,
      );
      return;
    }

    if (!prijava.firma_naziv?.trim()) {
      alert(`Naziv firme nije validan za korisnika: ${ime_prezime}`);
      return;
    }

    const startingNumberInput = window.prompt("Unesite broj sertifikata:");
    if (startingNumberInput === null) {
      return;
    }

    const sertifikatBroj = Number.parseInt(startingNumberInput.trim(), 10);
    if (!Number.isInteger(sertifikatBroj) || sertifikatBroj <= 0) {
      alert("Broj sertifikata mora biti pozitivan ceo broj.");
      return;
    }

    const getCurrentYearLastTwoDigits = () => {
      return String(new Date().getFullYear()).slice(-2);
    };

    const sertifikatData = {
      broj_sertifikata: sertifikatBroj,
      firma_naziv: prijava.firma_naziv.trim(),
      ime_prezime,
      seminar_naziv: seminarName,
      datum_seminara: formatDate(seminarDate, "dd. MMMM yyyy.", {
        locale: srLatn,
      }),
      godina_seminara: formatDate(seminarDate, "yyyy", {
        locale: srLatn,
      }),
      godina_sertifikata: getCurrentYearLastTwoDigits(),
    } satisfies SertifikatType;

    try {
      await generateSingleSertifikatDocument(sertifikatData);
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Došlo je do greške prilikom generisanja sertifikata.",
      );
    }
  };

  return (
    <>
      <TableRow sx={{ backgroundColor: "#95bb9f" }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            disabled={prijave.length === 0}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Tooltip title="Kreiraj račun">
            <IconButton
              color="success"
              onClick={() => {
                handleCreateRacun();
              }}
            >
              <MonetizationOnIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell>{prijave[0]?.firma_naziv}</TableCell>
        <TableCell>{prijave[0]?.firma_email}</TableCell>
        <TableCell>{prijave[0]?.firma_telefon}</TableCell>
        <TableCell>{prijave.length}</TableCell>
      </TableRow>
      <TableRow key={prijave[0]?.firma_id} sx={{ backgroundColor: "#c8d3c8" }}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Prijavljeni
              </Typography>
              <Table size="small" aria-label="prijave">
                <TableHead>
                  <TableRow>
                    <TableCell>Akcije</TableCell>
                    <TableCell>Ime</TableCell>
                    <TableCell>Prezime</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>Prisustvo</TableCell>
                    <TableCell>Vrsta prijave</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prijave.map((prijava) => (
                    <TableRow key={prijava.zaposleni_id}>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Generiši sertifikat">
                            <IconButton
                              color="success"
                              onClick={() =>
                                handleGenerateSingleCertificate(prijava)
                              }
                            >
                              <WorkspacePremiumIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            color="error"
                            onClick={() =>
                              onPrijavaDelete(prijava.zaposleni_id, seminarId)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>{prijava.zaposleni_ime}</TableCell>
                      <TableCell>{prijava.zaposleni_prezime}</TableCell>
                      <TableCell>{prijava.zaposleni_email}</TableCell>
                      <TableCell>{prijava.zaposleni_telefon}</TableCell>
                      <TableCell>{prijava.prisustvo}</TableCell>
                      <TableCell>{prijava.vrsta_prijave}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

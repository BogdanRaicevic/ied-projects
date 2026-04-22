import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Badge,
  Box,
  Collapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import type { PrijavaZodType } from "ied-shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeletePrijavaMutation } from "../../hooks/seminar/useSeminarMutations";
import {
  buildSingleSertifikat,
  getCertificateWarning,
  getPrijavaFullName,
} from "../../utils/certificate";
import CertificateNumberDialog, {
  type CertificateDialogSubmitValues,
} from "./CertificateNumberDialog";

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
  const [selectedPrijava, setSelectedPrijava] = useState<PrijavaZodType | null>(
    null,
  );
  const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOpenCertificateDialog = (prijava: PrijavaZodType) => {
    setSelectedPrijava(prijava);
    setSubmitError(null);
    setIsCertificateDialogOpen(true);
  };

  const handleCloseCertificateDialog = () => {
    if (isSubmitting) {
      return;
    }

    setSelectedPrijava(null);
    setSubmitError(null);
    setIsCertificateDialogOpen(false);
  };

  const selectedWarning = selectedPrijava
    ? getCertificateWarning(selectedPrijava)
    : "Prijava nije izabrana.";

  const dialogMessages = [
    ...(submitError ? [submitError] : []),
    ...(selectedWarning ? [selectedWarning] : []),
  ];

  const handleGenerateSingleCertificate = async ({
    certificateNumber,
    templateKey,
  }: CertificateDialogSubmitValues) => {
    if (!selectedPrijava) {
      return;
    }

    const { sertifikat, warning } = buildSingleSertifikat(selectedPrijava, {
      brojSertifikata: certificateNumber,
      seminarDate,
      seminarName,
      templateKey,
    });

    if (warning || !sertifikat) {
      setSubmitError(
        warning ?? "Nije moguće generisati sertifikat za izabranu prijavu.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSelectedPrijava(null);
      setIsCertificateDialogOpen(false);
    } catch (error) {
      console.error("Error generating certificate:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Došlo je do greške prilikom generisanja sertifikata.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Story 7.2.1/7.2.2: V2 entry mirrors V1's nav-state shape
  // (`{ prijave, seminarId }`) so the same handler signature works for both.
  // `firmaId` is intentionally not passed separately — V2's prefill hook
  // reads it from `prijave[0].firma_id` to match V1's existing convention.
  const handleCreateRacunV2 = () => {
    navigate("/racuni-v2", { state: { prijave, seminarId } });
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
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title="Kreiraj račun (V1)">
              <IconButton
                color="success"
                onClick={() => {
                  handleCreateRacun();
                }}
              >
                <MonetizationOnIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Kreiraj V2 račun">
              {/* Same icon as V1 keeps the action recognizable as "create
                  račun"; the small "V2" badge is the only visual
                  differentiator. Different icon would suggest a different
                  action — these do the same thing on different stacks. */}
              <IconButton
                color="primary"
                onClick={() => {
                  handleCreateRacunV2();
                }}
              >
                <Badge
                  badgeContent="V2"
                  color="primary"
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.55rem",
                      height: 14,
                      minWidth: 18,
                      padding: "0 4px",
                    },
                  }}
                >
                  <MonetizationOnIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Stack>
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
                                handleOpenCertificateDialog(prijava)
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
      <CertificateNumberDialog
        open={isCertificateDialogOpen}
        title="Za jedan sertifikat, postavi broj sertifikata"
        description={
          selectedPrijava
            ? `${getPrijavaFullName(selectedPrijava) || "Nepoznat korisnik"} - ${selectedPrijava.firma_naziv || "Nepoznata firma"}`
            : undefined
        }
        inputLabel="Broj sertifikata"
        alertMessages={dialogMessages}
        alertSeverity={dialogMessages.length > 0 ? "error" : "warning"}
        disableConfirm={Boolean(selectedWarning)}
        isSubmitting={isSubmitting}
        onClose={handleCloseCertificateDialog}
        onConfirm={handleGenerateSingleCertificate}
      />
    </>
  );
}

import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
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
import type { PrijavaZodType } from "ied-shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeletePrijavaMutation } from "../../hooks/seminar/useSeminarMutations";

export default function PrijaveSeminarTable({
  seminarId,
  prijave,
}: {
  seminarId: string;
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
                        <IconButton
                          color="error"
                          onClick={() =>
                            onPrijavaDelete(prijava.zaposleni_id, seminarId)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
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

import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Typography,
  Table,
  TableHead,
  TableBody,
  Tooltip,
} from "@mui/material";
import { Box } from "@mui/system";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useState } from "react";
import type { PrijavaNaSeminar } from "../../schemas/firmaSchemas";
import DeleteIcon from "@mui/icons-material/Delete";
import { deletePrijava } from "../../api/seminari.api";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { useNavigate } from "react-router-dom";

export default function PrijaveSeminarTable({
  prijave,
  onDelete,
}: {
  prijave: PrijavaNaSeminar[];
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const onePrijavaDelete = async (zaposleni_id: string, seminar_id: string) => {
    const confirmed = window.confirm("Da li ste sigurni da želite da obrišete prijavu?");
    if (confirmed) {
      await deletePrijava(zaposleni_id, seminar_id);
      onDelete?.();
    }
  };

  const navigate = useNavigate();
  const handleCreateRacun = () => {
    navigate("/racuni", { state: { prijave } });
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
        <TableCell>{prijave[0].firma_naziv}</TableCell>
        <TableCell>{prijave[0].firma_email}</TableCell>
        <TableCell>{prijave[0].firma_telefon}</TableCell>
        <TableCell>{prijave.length}</TableCell>
      </TableRow>
      <TableRow key={prijave[0].firma_id} sx={{ backgroundColor: "#c8d3c8" }}>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prijave.map((prijava) => (
                    <TableRow key={prijava.zaposleni_id}>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => onePrijavaDelete(prijava.zaposleni_id, prijava.seminar_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{prijava.zaposleni_ime}</TableCell>
                      <TableCell>{prijava.zaposleni_prezime}</TableCell>
                      <TableCell>{prijava.zaposleni_email}</TableCell>
                      <TableCell>{prijava.zaposleni_telefon}</TableCell>
                      <TableCell>{prijava.prisustvo}</TableCell>
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

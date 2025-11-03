import type {
  FirmaType,
  PrijavaZodType,
  ZaposleniType,
} from "@ied-shared/index";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { createPrijava } from "../../api/seminari.api";
import { useFetchSeminari } from "../../hooks/useFetchData";

export default function PrijavaNaSeminarDialog({
  open,
  onClose,
  companyData,
  zaposleniData,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  companyData: FirmaType;
  zaposleniData: ZaposleniType;
  onSuccess: (seminar: string) => void;
}) {
  const [prijavaState, setPrijavaState] = useState<
    "success" | "warning" | "error" | ""
  >("");
  const [selectedSeminarId, setSelectedSeminarId] = useState<string>("");
  const [prisustvo, setPrisustvo] = useState<"online" | "offline">("online");
  const [vrstaPrijave, setVrstaPrijave] = useState<
    "telefon" | "email" | "drustvene_mreze"
  >("email");

  useEffect(() => {
    if (open) {
      setPrijavaState("");
      setSelectedSeminarId("");
      setPrisustvo("online");
      setVrstaPrijave("email");
    }
  }, [open]);

  const handleSavePrijava = async () => {
    if (!companyData?._id || !zaposleniData?._id || !selectedSeminarId) {
      throw new Error("Nedostaju podaci o firmi, zaposlenom ili seminaru");
    }

    const prijava: PrijavaZodType = {
      firma_id: companyData._id,
      zaposleni_id: zaposleniData._id,
      firma_naziv: companyData.naziv_firme || "",
      firma_email: companyData.e_mail || "",
      firma_telefon: companyData.telefon || "",
      zaposleni_ime: zaposleniData.ime,
      zaposleni_prezime: zaposleniData.prezime,
      zaposleni_email: zaposleniData.e_mail,
      zaposleni_telefon: zaposleniData.telefon,
      prisustvo,
      vrsta_prijave: vrstaPrijave,
    };

    try {
      await createPrijava(selectedSeminarId, prijava);
      onSuccess(
        fetchedSeminars?.seminari.find((s) => s._id === selectedSeminarId)
          ?.naziv || "",
      );
    } catch (error: any) {
      if (error.cause === "duplicate") {
        setPrijavaState("warning");
      } else {
        setPrijavaState("error");
      }
    }
  };

  const { fetchedSeminars } = useFetchSeminari();

  const seminari = fetchedSeminars?.seminari;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>{"Prijavi osobu na seminar"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="center">
          <Grid size={12}>
            <TextField
              sx={{ m: 2 }}
              key={"prijava-naziv-firme"}
              value={companyData?.naziv_firme || "/"}
              label="Naziv Firme"
              disabled
            />
            <TextField
              sx={{ m: 2 }}
              key={"prijava-email-firme"}
              value={companyData?.e_mail || "/"}
              label="Email Firme"
              disabled
            />
            <TextField
              sx={{ m: 2 }}
              key={"prijava-telefon-firme"}
              value={companyData?.telefon || "/"}
              label="Telefon Firme"
              disabled
            />
          </Grid>
          <Grid size={12}>
            <TextField
              sx={{ m: 2 }}
              key={"prijava-ime-zaposlenog"}
              value={zaposleniData?.ime || "/"}
              label="Ime zaposlenog"
              disabled
            />
            <TextField
              sx={{ m: 2 }}
              key={"prijava-prezime-zaposlenog"}
              value={zaposleniData?.prezime || "/"}
              label="Prezime zaposlenog"
              disabled
            />
            <TextField
              sx={{ m: 2 }}
              key={"prijava-telefon-zaposlenog"}
              value={zaposleniData?.telefon || "/"}
              label="Telefon zaposlenog"
              disabled
            />
            <TextField
              sx={{ m: 2 }}
              key={"prijava-email-zaposlenog"}
              value={zaposleniData?.e_mail || "/"}
              label="Email zaposlenog"
              disabled
            />
          </Grid>

          <Grid size={12}>
            <FormControl sx={{ m: 2 }}>
              <FormLabel>Prisustvo</FormLabel>
              <RadioGroup
                aria-labelledby="prisustvo-radio-buttons-group-label"
                defaultValue="online"
                name="radio-buttons-group"
                onChange={(e) =>
                  setPrisustvo(e.target.value as "online" | "offline")
                }
              >
                <FormControlLabel
                  value="online"
                  control={<Radio />}
                  label="Online"
                />
                <FormControlLabel
                  value="offline"
                  control={<Radio />}
                  label="Offline"
                />
              </RadioGroup>
            </FormControl>
            <FormControl sx={{ m: 2 }}>
              <FormLabel>Vrsta Prijave</FormLabel>
              <RadioGroup
                aria-labelledby="vrsta-prijave-radio-buttons-group-label"
                defaultValue="email"
                name="vrsta-prijave-radio-buttons-group"
                onChange={(e) =>
                  setVrstaPrijave(
                    e.target.value as "telefon" | "email" | "drustvene_mreze",
                  )
                }
              >
                <FormControlLabel
                  value="email"
                  control={<Radio />}
                  label="Email"
                />
                <FormControlLabel
                  value="telefon"
                  control={<Radio />}
                  label="Telefon"
                />
                <FormControlLabel
                  value="drustvene_mreze"
                  control={<Radio />}
                  label="Društvene mreže"
                />
              </RadioGroup>
            </FormControl>
            <Autocomplete
              options={seminari || []}
              getOptionLabel={(option) =>
                `${format(option.datum, "dd.MM.yyyy")} - ${option.naziv}`
              }
              renderOption={(params, option) => (
                <Box component="li" {...params} key={option._id}>
                  <Box>
                    <Typography variant="caption" display="block">
                      {format(option.datum, "dd.MM.yyyy")}
                    </Typography>
                    <Typography variant="body1" sx={{ pl: 3 }}>
                      {option.naziv}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Seminar" />
              )}
              onChange={(_, value) => setSelectedSeminarId(value?._id || "")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      {prijavaState === "error" && (
        <Alert severity="error" sx={{ m: 2 }}>
          Neuspešno čuvanje prijave na seminar
        </Alert>
      )}
      {prijavaState === "warning" && (
        <Alert severity="warning" sx={{ m: 2 }}>
          Zaposleni je već prijavljen na seminar
        </Alert>
      )}
      <DialogActions>
        <Button
          disabled={!selectedSeminarId}
          variant="contained"
          color="success"
          onClick={handleSavePrijava}
        >
          Sačuvaj prijavu
        </Button>
        <Button onClick={onClose} variant="outlined" color="error">
          Napusti
        </Button>
      </DialogActions>
    </Dialog>
  );
}

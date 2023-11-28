import { UnfoldLess } from "@mui/icons-material";
import { Box, Button, FormControl, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function () {
  const parametriPretrage = () => (
    <Box>
      <h1>Parametri Pretrage</h1>
      <TextField sx={{ m: 1 }} id="predavac" label="Predavac" variant="outlined" />
      <TextField sx={{ m: 1 }} id="naziv" label="Naziv seminara" variant="outlined" />
      <TextField sx={{ m: 1 }} id="tip" label="Tip Seminara" variant="outlined" />
      <TextField sx={{ m: 1 }} id="broj-ucesnika" label="Broj ucesnika" variant="outlined" />
      <FormControl sx={{ m: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker format="yyyy/MM/dd" label="Pocetni datum" />
          <Box display="flex" alignItems="center" justifyContent="center">
            <UnfoldLess />
          </Box>
          <DatePicker format="yyyy/MM/dd" label="Kranji datum" />
        </LocalizationProvider>
      </FormControl>
    </Box>
  );

  return (
    <>
      {parametriPretrage()}
      <Button size="large" variant="contained" color="info" type="submit">
        Pretrazi
      </Button>
    </>
  );
}

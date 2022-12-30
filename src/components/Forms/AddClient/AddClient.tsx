import { AccountCircle, Email, Person, Phone } from "@mui/icons-material";
import { FormControl, InputAdornment, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

export default function AddClient() {
  return (
    <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }} noValidate autoComplete="off">
      <div>
        <Typography variant="h4" component="h4">
          Dodajte zaposlenog kompanije
        </Typography>
        <FormControl key={"ime"} sx={{ m: 2, width: "50ch" }}>
          <TextField
            label="Ime"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>

        <FormControl key={"prezime"} sx={{ m: 2, width: "50ch" }}>
          <TextField
            label="Prezime"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>

        <FormControl key={"email"} sx={{ m: 2, width: "50ch" }}>
          <TextField
            label="Email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>

        <FormControl key={"tel"} sx={{ m: 2, width: "50ch" }}>
          <TextField
            label="Telefon"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
      </div>
    </Box>
  );
}

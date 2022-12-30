import { FormControl, InputAdornment, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { clientFormMetadata } from "./clientFormMetadata";

const items = clientFormMetadata.map((item) => {
  return (
    <FormControl key={item.key} sx={{ m: 2, width: "50ch" }}>
      <TextField
        label={item.label}
        InputProps={{
          startAdornment: <InputAdornment position="start">{item.inputAdornment}</InputAdornment>,
        }}
      />
    </FormControl>
  );
});

export default function AddClient() {
  return (
    <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }} noValidate autoComplete="off">
      <div>
        <Typography variant="h4" component="h4">
          Dodajte zaposlenog kompanije
        </Typography>
        {items}
      </div>
    </Box>
  );
}

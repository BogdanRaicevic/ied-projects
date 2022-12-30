import { FormControl, InputAdornment, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { companyFormMetadata } from "./companyFormMetadata";

const items = companyFormMetadata.map((item) => {
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

export default function CompanyForm() {
  return (
    <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }} noValidate autoComplete="off">
      <div>
        <Typography variant="h4" component="h4">
          Dodajte kompaniju
        </Typography>
        {items}
      </div>
    </Box>
  );
}

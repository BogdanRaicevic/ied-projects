import { Button, FormControl, InputAdornment } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState } from "react";

export default function MyForm({ formMetadata, formData }) {
  const [data, setData] = useState(formData);
  console.log("my data", data);

  const items = formMetadata.map((item) => {
    return (
      <FormControl key={item.key} sx={{ m: 2, width: "35ch" }}>
        <TextField
          label={item.label}
          InputProps={{
            startAdornment: <InputAdornment position="start">{item.inputAdornment}</InputAdornment>,
          }}
          value={data[item.key]}
        />
      </FormControl>
    );
  });

  return (
    <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }} noValidate autoComplete="off">
      {items}
      <Button sx={{ m: 2, ml: 3, width: "35ch" }} size="large" variant="contained" color="success">
        Sačuvaj
      </Button>
    </Box>
  );
}

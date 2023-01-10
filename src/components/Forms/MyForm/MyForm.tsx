import { Button, FormControl, InputAdornment } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState } from "react";

export default function MyForm({ formMetadata, formData }) {
  const [data, setData] = useState(formData);

  function handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    setData({
      ...data,
      [name]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  const items = formMetadata.map((item) => {
    return (
      <FormControl key={item.key} sx={{ m: 2, width: "35ch" }}>
        <TextField
          label={item.label}
          InputProps={{
            startAdornment: <InputAdornment position="start">{item.inputAdornment}</InputAdornment>,
          }}
          value={data[item.key] || ""}
          name={item.key}
          onChange={handleChange}
        />
      </FormControl>
    );
  });

  return (
    <Box
      onSubmit={handleSubmit}
      component="form"
      sx={{ display: "flex", flexWrap: "wrap" }}
      noValidate
      autoComplete="off"
    >
      {items}
      <Button sx={{ m: 2, ml: 3, width: "35ch" }} size="large" variant="contained" color="success" type="submit">
        Sačuvaj
      </Button>
    </Box>
  );
}

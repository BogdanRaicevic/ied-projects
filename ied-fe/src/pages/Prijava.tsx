import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Copyright } from "@mui/icons-material";
import { CssBaseline, Avatar, Typography, FormControlLabel, Checkbox } from "@mui/material";
import { Container, Box } from "@mui/system";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useMutation } from "react-query";
import { login } from "../api/login";

export default function Prijava() {
  const mutation = useMutation(login);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email") as string; // Ensure email is of type string
    const password = data.get("password") as string; // Ensure password is of type string
    console.log("ovo je sa FE", {
      email,
      password,
    });

    mutation.mutate({ email, password });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Prijava
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Prijava
          </Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mt: 8, mb: 4 }}>
          <Copyright />
          <Typography variant="body2" color="textSecondary" align="center">
            Institut za Ekonomsku Diplomatiju
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

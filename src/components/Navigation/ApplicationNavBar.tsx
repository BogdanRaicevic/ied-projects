import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";

export default function ApplicationNavBar() {
  const navItems = ["Evidencija", "Privremene", "Pretrage", "Računi", "Sertifikati"];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: "#fff" }}>
                {item}
              </Button>
            ))}
          </Box>
          <Button sx={{ color: "#fff" }}>PRIJAVA/ODJAVA</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

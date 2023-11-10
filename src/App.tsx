import Container from "@mui/material/Container";
import { Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { Evidencija, Pretrage, Racuni, Prijava } from "./pages";
import Firma from "./pages/Firma";

function App() {
  return (
    <Container component="main" maxWidth="lg">
      <Navigation></Navigation>

      <Routes>
        <Route path="/" element={<h1>hello</h1>}></Route>
        <Route path="/evidencija" element={<Evidencija />}></Route>
        <Route path="/pretrage" element={<Pretrage />}></Route>
        <Route path="/racuni" element={<Racuni />}></Route>
        <Route path="/prijava" element={<Prijava />}></Route>
        <Route path="/firma" element={<Firma />}></Route>
      </Routes>
    </Container>
  );
}

export default App;

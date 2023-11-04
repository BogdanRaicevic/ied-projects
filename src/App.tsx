import Container from "@mui/material/Container";
import { Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { Evidencija, Pretrage, Racuni, Sertifikati, Prijava } from "./pages";

function App() {
  return (
    <Container component="main" maxWidth="lg">
      <Navigation></Navigation>

      <Routes>
        <Route path="/" element={<h1>hello</h1>}></Route>
        <Route path="/evidencija" element={<Evidencija />}></Route>
        <Route path="/pretrage" element={<Pretrage />}></Route>
        <Route path="/racuni" element={<Racuni />}></Route>
        <Route path="sertifikati" element={<Sertifikati />}></Route>
        <Route path="/prijava" element={<Prijava />}></Route>
      </Routes>
    </Container>
  );
}

export default App;

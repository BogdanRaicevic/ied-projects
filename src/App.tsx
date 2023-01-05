import Container from "@mui/material/Container";
import { Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { Evidencija, Pretrage, Privremene, Racuni, Sertifikati, Prijava } from "./pages";

function App() {
  return (
    <Container component="main" maxWidth="lg">
      <Navigation></Navigation>
      <h1>Hello world</h1>

      <Routes>
        <Route path="/" element={<h1>hello</h1>}></Route>
        <Route path="/evidencija" element={<Evidencija />}></Route>
        <Route path="/pretrage" element={<Pretrage />}></Route>
        <Route path="/privremene" element={<Privremene />}></Route>
        <Route path="/racuni" element={<Racuni />}></Route>
        <Route path="sertifikati" element={<Sertifikati />}></Route>
        <Route path="/prijava" element={<Prijava />}></Route>
      </Routes>
    </Container>
  );
}

export default App;

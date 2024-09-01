import Container from "@mui/material/Container";
import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { Evidencija, Pretrage, Racuni, Prijava, Zaposleni, Seminari } from "./pages";
import Firma from "./pages/Firma";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Container component="main" maxWidth="lg">
        <Navigation></Navigation>

        <Routes>
          {/* home route set to /pretrage becuase that is only functional page for now */}
          <Route path="/" element={<Navigate to="/pretrage" />}></Route>
          <Route path="/evidencija" element={<Evidencija />}></Route>
          <Route path="/pretrage" element={<Pretrage />}></Route>
          <Route path="/racuni" element={<Racuni />}></Route>
          <Route path="/prijava" element={<Prijava />}></Route>
          <Route path="/firma/:id" element={<Firma />}></Route>
          <Route path="/zaposleni" element={<Zaposleni />}></Route>
          <Route path="/seminari" element={<Seminari />}></Route>
        </Routes>
      </Container>
    </QueryClientProvider>
  );
}

export default App;

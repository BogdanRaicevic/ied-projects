import Container from "@mui/material/Container";
import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { Evidencija, Pretrage, Racuni, Zaposleni, Seminari } from "./pages";
import Firma from "./pages/Firma";
import { QueryClient, QueryClientProvider } from "react-query";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Container component="main" maxWidth="lg">
        <Navigation></Navigation>

        <Routes>
          <Route
            path="/"
            element={
              <>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
                <SignedIn>
                  <Navigate to="/pretrage" />
                </SignedIn>
              </>
            }
          />
          {/* <Route path="/evidencija" element={<Evidencija />}></Route> */}
          <Route
            path="/pretrage"
            element={
              <SignedIn>
                <Pretrage />
              </SignedIn>
            }
          ></Route>
          {/* <Route path="/racuni" element={<Racuni />}></Route> */}
          <Route path="/firma" element={<Firma />}></Route>
          <Route path="/firma/:id" element={<Firma />}></Route>
          <Route path="/zaposleni" element={<Zaposleni />}></Route>
          <Route
            path="/seminari"
            element={
              <SignedIn>
                <Seminari />
              </SignedIn>
            }
          ></Route>
        </Routes>
      </Container>
    </QueryClientProvider>
  );
}

export default App;

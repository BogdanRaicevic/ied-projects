import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import Container from "@mui/material/Container";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { AuditLog, Pretrage, Racuni, Seminari } from "./pages";
import Firma from "./pages/Firma";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Container component="main" maxWidth="lg">
        <Navigation />
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
        <SignedIn>
          <Routes>
            <Route path="/" element={<Navigate to="/pretrage" />} />
            <Route path="/pretrage" element={<Pretrage />} />
            <Route path="/racuni" element={<Racuni />} />
            <Route path="/firma" element={<Firma />} />
            <Route path="/firma/:id" element={<Firma />} />
            <Route path="/seminari" element={<Seminari />} />
            <Route path="/audit-log" element={<AuditLog />} />
          </Routes>
        </SignedIn>
      </Container>
    </QueryClientProvider>
  );
}

export default App;

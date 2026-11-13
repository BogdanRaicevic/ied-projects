import { RedirectToSignIn, Show } from "@clerk/react";
import { Box, CircularProgress } from "@mui/material";
import Container from "@mui/material/Container";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { env } from "./utils/envVariables";

// Each page becomes its own chunk, downloaded on first visit.
const AuditLog = lazy(() => import("./pages/AuditLog"));
const Firma = lazy(() => import("./pages/Firma"));
const Pretrage = lazy(() => import("./pages/Pretrage"));
const Racuni = lazy(() => import("./pages/Racuni"));
const RacuniV2 = lazy(() => import("./pages/RacuniV2"));
const Seminari = lazy(() => import("./pages/Seminari"));

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
        <Show when="signed-out">
          <RedirectToSignIn />
        </Show>
        <Show when="signed-in">
          <Suspense
            fallback={
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            <Routes>
              <Route path="/" element={<Navigate to="/pretrage" />} />
              <Route path="/pretrage" element={<Pretrage />} />
              <Route path="/racuni" element={<Racuni />} />
              {env.ffRacuniV2 && (
                <Route path="/racuni-v2" element={<RacuniV2 />} />
              )}
              <Route path="/firma" element={<Firma />} />
              <Route path="/firma/:id" element={<Firma />} />
              <Route path="/seminari" element={<Seminari />} />
              <Route path="/audit-log" element={<AuditLog />} />
            </Routes>
          </Suspense>
        </Show>
      </Container>
    </QueryClientProvider>
  );
}

export default App;

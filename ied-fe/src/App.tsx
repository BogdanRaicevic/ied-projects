import Container from "@mui/material/Container";
import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { Pretrage, Zaposleni, Seminari } from "./pages";
import Firma from "./pages/Firma";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Container component="main" maxWidth="lg">
				<Navigation />
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
					/>
					{/* <Route path="/racuni" element={<Racuni />}></Route> */}
					<Route path="/firma" element={<Firma />} />
					<Route path="/firma/:id" element={<Firma />} />
					<Route path="/zaposleni" element={<Zaposleni />} />
					<Route
						path="/seminari"
						element={
							<SignedIn>
								<Seminari />
							</SignedIn>
						}
					/>
				</Routes>
			</Container>
		</QueryClientProvider>
	);
}

export default App;

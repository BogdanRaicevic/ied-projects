import Container from "@mui/material/Container";
import AddClient from "./components/Forms/AddClient";
import Navigation from "./components/Navigation";

function App() {
  return (
    <Container component="main" maxWidth="lg">
      <Navigation></Navigation>
      <h1>Hello world</h1>

      <AddClient></AddClient>
    </Container>
  );
}

export default App;

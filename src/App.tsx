import Container from "@mui/material/Container";
import CompaniesDataGrid from "./components/DataGrid";
import AddClient from "./components/Forms/AddClient";
import CompanyForm from "./components/Forms/AddCompany";
import Navigation from "./components/Navigation";

function App() {
  return (
    <Container component="main" maxWidth="lg">
      <Navigation></Navigation>
      <h1>Hello world</h1>

      <AddClient></AddClient>
      <CompanyForm></CompanyForm>
      <CompaniesDataGrid></CompaniesDataGrid>
    </Container>
  );
}

export default App;

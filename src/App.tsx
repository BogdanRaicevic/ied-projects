import Container from "@mui/material/Container";
import { useCallback, useMemo } from "react";
import CompaniesTable from "./components/CompanyTable";
import { CompanyTableColumns } from "./components/CompanyTable/CompanyTableColumns";
import AddClient from "./components/Forms/AddClient";
import CompanyForm from "./components/Forms/AddCompany";
import Navigation from "./components/Navigation";
import { IOptionalCompanyData, companiesData } from "./fakeData/companyData";

function App() {
  const columns = useMemo(() => CompanyTableColumns, []);
  const data: IOptionalCompanyData[] = useMemo(() => companiesData, []);

  const renderRowSubComponent = useCallback(
    ({ row }) => (
      <pre>
        <code>{JSON.stringify({ zaposleni: row.values.zaposleni }, null, 2)}</code>
      </pre>
    ),
    []
  );

  return (
    <Container component="main" maxWidth="lg">
      <Navigation></Navigation>
      <h1>Hello world</h1>

      <AddClient></AddClient>
      <CompanyForm></CompanyForm>
      <CompaniesTable columns={columns} data={data} renderRowSubComponent={renderRowSubComponent}></CompaniesTable>
    </Container>
  );
}

export default App;

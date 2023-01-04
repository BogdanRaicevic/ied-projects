import Container from "@mui/material/Container";
import { useCallback, useMemo } from "react";
import MyTable from "./components/CompanyTable";
import { CompanyTableColumns, ZaposleniTableColumns } from "./components/CompanyTable/TableColumns";
import AddClient from "./components/Forms/AddClient";
import CompanyForm from "./components/Forms/AddCompany";
import Navigation from "./components/Navigation";
import { IOptionalCompanyData, companiesData } from "./fakeData/companyData";

function App() {
  const columns = useMemo(() => CompanyTableColumns, []);
  const data: IOptionalCompanyData[] = useMemo(() => companiesData, []);
  const zaposleniInitialState = { hiddenColumns: ["id", "firmaId"] };

  const renderRowSubComponent = useCallback(({ row }) => {
    return (
      <MyTable
        columns={ZaposleniTableColumns}
        data={row.values.zaposleni}
        initialState={zaposleniInitialState}
        renderRowSubComponent={false}
      ></MyTable>
    );
  }, []);
  const companyInitialState = { hiddenColumns: ["id", "zaposleni"] };

  return (
    <Container component="main" maxWidth="lg">
      <Navigation></Navigation>
      <h1>Hello world</h1>

      <AddClient></AddClient>
      <CompanyForm></CompanyForm>
      <MyTable
        columns={columns}
        data={data}
        initialState={companyInitialState}
        renderRowSubComponent={renderRowSubComponent}
      ></MyTable>
    </Container>
  );
}

export default App;

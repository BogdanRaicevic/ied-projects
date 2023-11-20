import { MaterialReactTable } from "material-react-table";
import { useLocation } from "react-router-dom";
import { myZaposleniColumns } from "../components/MyTable/myCompanyColumns";
import CompanyForm from "../components/Forms/CompanyForm";
import AttendedSeminarsAccordion from "../components/Accordion";
import { Company } from "../schemas/companySchemas";

export default function Firma() {
  const location = useLocation();
  const data = location.state as Company;

  // TODO: fix this to be like company table
  function renderZaposleniTable(): React.ReactNode {
    return (
      <MaterialReactTable
        columns={myZaposleniColumns}
        data={data?.zaposleni || []}
        enableColumnOrdering
        enableGlobalFilter={true} //turn off a feature
      />
    );
  }

  return (
    <>
      <h1>Firma: {data.naziv}</h1>
      <CompanyForm data={data}></CompanyForm>
      {renderZaposleniTable()}

      <AttendedSeminarsAccordion firma={data}></AttendedSeminarsAccordion>
    </>
  );
}

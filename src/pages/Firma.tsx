import { MaterialReactTable } from "material-react-table";
import { useLocation } from "react-router-dom";
import { myZaposleniColumns } from "../components/MyTable/myCompanyColumns";
import CompanyForm from "../components/Forms/CompanyForm";
import AttendedSeminarsAccordion from "../components/Accordion";
import { Company } from "../schemas/companySchemas";
import PrijavaOdjava from "../components/PrijavaOdjava";
import { useState } from "react";

export default function Firma() {
  const location = useLocation();
  const [data, setData] = useState((location.state as Company) || {});

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

  function handlePrijavaChange(event: React.ChangeEvent<HTMLInputElement>) {
    setData((prevState) => ({ ...prevState, zeleMarketingMaterijal: event.target.checked }));
  }

  return (
    <>
      <h1>Firma: {data?.naziv}</h1>
      <PrijavaOdjava
        prijavljeniValue={data.zeleMarketingMaterijal}
        prijavaChange={handlePrijavaChange}
      ></PrijavaOdjava>
      <CompanyForm data={data}></CompanyForm>
      {renderZaposleniTable()}

      <AttendedSeminarsAccordion firma={data}></AttendedSeminarsAccordion>
    </>
  );
}

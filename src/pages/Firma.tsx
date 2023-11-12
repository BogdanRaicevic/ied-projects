import MaterialReactTable from "material-react-table";
import { useLocation } from "react-router-dom";
import { myZaposleniColumns } from "../components/MyTable/myCompanyColumns";
import CompanyForm from "../components/Forms/CompanyForm";
import AttendedSeminarsAccordion from "../components/Accordion";

export default function Firma() {
  const location = useLocation();
  const data = location.state;
  console.log(data);

  function renderZaposleniTable(): React.ReactNode {
    return (
      <MaterialReactTable
        columns={myZaposleniColumns}
        data={data.zaposleni}
        enableColumnOrdering
        enableGlobalFilter={true} //turn off a feature
        muiTableProps={{
          sx: {
            "table, th, td": {
              border: 1,
              borderColor: "lightgray",
              borderStyle: "solid",
            },
            th: {
              backgroundColor: "#adadad",
            },
            "& tr:nth-of-type(4n+1)": {
              backgroundColor: "#e3f2f7",
            },
          },
        }}
      />
    );
  }

  const seminari = [
    {
      naziv: "Seminar 1",
      datum: "2021-10-10",
      ucesnici: ["Pera", "Mika", "Zika"],
    },
    {
      naziv: "Seminar 2",
      datum: "2023-10-10",
      ucesnici: ["Joca", "Mika", "Boca"],
    },
    {
      naziv: "Seminar 3",
      datum: "2020-11-10",
      ucesnici: ["Joca"],
    },
  ];

  return (
    <>
      <h1>Firma: {data.naziv}</h1>
      <CompanyForm data={data}></CompanyForm>
      {renderZaposleniTable()}
      <AttendedSeminarsAccordion seminari={seminari}></AttendedSeminarsAccordion>
    </>
  );
}

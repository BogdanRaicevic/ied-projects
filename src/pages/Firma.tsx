import MaterialReactTable from "material-react-table";
import { useLocation } from "react-router-dom";
import { myZaposleniColumns } from "../components/MyTable/myCompanyColumns";
import CompanyForm from "../components/Forms/CompanyForm";

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

  return (
    <>
      <h1>Firma: {data.naziv}</h1>
      <CompanyForm data={data}></CompanyForm>
      {renderZaposleniTable()}
    </>
  );
}

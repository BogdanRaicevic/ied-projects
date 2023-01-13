import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import { companiesData } from "../fakeData/companyData";

export default function Pretrage() {
  return (
    <>
      <PageTitle title={"Pretrage"} />
      <MyTable data={companiesData}></MyTable>
    </>
  );
}

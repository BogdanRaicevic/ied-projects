import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { companiesData } from "../fakeData/companyData";

export default function Pretrage() {
  const checkboxOptions = { parent: "bogic", children: ["a", "b", "v"] };
  return (
    <>
      <PageTitle title={"Pretrage"} />
      <IndeterminateCheckbox options={checkboxOptions} />
      <MyTable data={companiesData}></MyTable>
    </>
  );
}

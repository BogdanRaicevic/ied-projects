import { Typography } from "@mui/material";
import { useMemo, useCallback } from "react";
import CompanyTable from "../components/CompanyTable";
import { CompanyTableColumns, ZaposleniTableColumns } from "../components/CompanyTable/TableColumns";
import PageTitle from "../components/PageTitle";
import { IOptionalCompanyData, companiesData } from "../fakeData/companyData";

export default function Evidencija() {
  const columns = useMemo(() => CompanyTableColumns, []);
  const data: IOptionalCompanyData[] = useMemo(() => companiesData, []);
  const zaposleniInitialState = { hiddenColumns: ["id", "firmaId"] };

  const renderRowSubComponent = useCallback(({ row }: any) => {
    return (
      <CompanyTable
        columns={ZaposleniTableColumns}
        data={row.values.zaposleni}
        initialState={zaposleniInitialState}
        renderRowSubComponent={false}
      ></CompanyTable>
    );
  }, []);
  const companyInitialState = { hiddenColumns: ["id", "zaposleni"] };

  return (
    <>
      <PageTitle title={"Evidencija"} />
      <CompanyTable
        columns={columns}
        data={data}
        initialState={companyInitialState}
        renderRowSubComponent={renderRowSubComponent}
      ></CompanyTable>
    </>
  );
}

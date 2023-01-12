import { Add } from "@mui/icons-material";
import { Fab } from "@mui/material";
import { useMemo, useCallback, useState } from "react";
import CompanyTable from "../components/CompanyTable";
import { CompanyTableColumns, ZaposleniTableColumns } from "../components/CompanyTable/TableColumns";
import CompanyForm from "../components/Forms/CompanyForm";
import MyDialog from "../components/MyDialog/MyDialog";
import PageTitle from "../components/PageTitle";
import { companiesData } from "../fakeData/companyData";
import { Company } from "../schemas/companySchemas";

export default function Evidencija() {
  const columns = useMemo(() => CompanyTableColumns, []);
  const data: Company[] = useMemo(() => companiesData, []);
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

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <PageTitle title={"Evidencija"} />
      <Fab onClick={handleOpen} color="primary" aria-label="add">
        <Add />
      </Fab>
      <MyDialog open={open} handleClose={handleClose}>
        <CompanyForm></CompanyForm>
      </MyDialog>
      <CompanyTable
        columns={columns}
        data={data}
        initialState={companyInitialState}
        renderRowSubComponent={renderRowSubComponent}
      ></CompanyTable>
    </>
  );
}

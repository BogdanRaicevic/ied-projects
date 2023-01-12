import { Add } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Typography } from "@mui/material";
import zIndex from "@mui/material/styles/zIndex";
import { useMemo, useCallback, useState } from "react";
import CompanyTable from "../components/CompanyTable";
import { CompanyTableColumns, ZaposleniTableColumns } from "../components/CompanyTable/TableColumns";
import CompanyForm from "../components/Forms/CompanyForm";
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
      <Dialog fullScreen open={open} onClose={handleClose}>
        <DialogTitle align="center" variant="h4" boxShadow={10} zIndex={999}>
          Nova Firma
        </DialogTitle>
        <DialogContent>
          <CompanyForm></CompanyForm>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="warning" size="large" onClick={handleClose}>
            Izađi
          </Button>
          <Button variant="contained" color="success" size="large" onClick={handleClose}>
            Sačuvaj
          </Button>
        </DialogActions>
      </Dialog>
      <CompanyTable
        columns={columns}
        data={data}
        initialState={companyInitialState}
        renderRowSubComponent={renderRowSubComponent}
      ></CompanyTable>
    </>
  );
}

import { Add } from "@mui/icons-material";
import { Box, Divider, Fab, Fade, Modal, Typography } from "@mui/material";
import { useMemo, useCallback, useState } from "react";
import CompanyTable from "../components/CompanyTable";
import { CompanyTableColumns, ZaposleniTableColumns } from "../components/CompanyTable/TableColumns";
import MyForm from "../components/Forms/MyForm";
import { companyFormMetadata } from "../components/Forms/MyForm/formMetadata";
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

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    width: "80%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
  };

  return (
    <>
      <PageTitle title={"Evidencija"} />
      <Fab onClick={handleOpen} color="primary" aria-label="add">
        <Add />
      </Fab>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography variant="h4" mb={2}>
              {"Nova firma"}
            </Typography>
            <Divider sx={{ mb: 4 }} />
            {<MyForm formMetadata={companyFormMetadata} formData={[]} />}
          </Box>
        </Fade>
      </Modal>
      <CompanyTable
        columns={columns}
        data={data}
        initialState={companyInitialState}
        renderRowSubComponent={renderRowSubComponent}
      ></CompanyTable>
    </>
  );
}

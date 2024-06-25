import { Add } from "@mui/icons-material";
import { Fab } from "@mui/material";
import { useState } from "react";
// import CompanyForm from "../components/Forms/CompanyForm";
import MyDialog from "../components/MyDialog/MyDialog";
import PageTitle from "../components/PageTitle";

export default function Evidencija() {
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
        {/* <CompanyForm></CompanyForm> */}
      </MyDialog>
    </>
  );
}

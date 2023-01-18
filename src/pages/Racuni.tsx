import { Button } from "@mui/material";
import PageTitle from "../components/PageTitle";
import { createPdf } from "../fakeData/predracunTemplate";

export default function Racuni() {
  return (
    <>
      <PageTitle title={"Racuni"}></PageTitle>
      <Button variant="contained" onClick={createPdf}>
        Klikni ovde da generises racun
      </Button>
    </>
  );
}

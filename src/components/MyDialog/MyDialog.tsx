import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { DomainAdd } from "@mui/icons-material";

export default function MyDialog(props) {
  return (
    <Dialog maxWidth="lg" open={props.open} onClose={props.handleClose}>
      <DialogTitle align="center" variant="h4" boxShadow={10} zIndex={999}>
        <span>
          <DomainAdd color="success" sx={{ backgroundColor: "white", mx: 1 }} />
          Nova firma
          <DomainAdd color="success" sx={{ backgroundColor: "white", mx: 1 }} />
        </span>
      </DialogTitle>
      <DialogContent>{props.children}</DialogContent>
      <DialogActions>
        <Button variant="outlined" color="warning" size="large" onClick={props.handleClose}>
          Izađi
        </Button>
        <Button variant="contained" color="success" size="large" onClick={props.handleClose}>
          Sačuvaj
        </Button>
      </DialogActions>
    </Dialog>
  );
}

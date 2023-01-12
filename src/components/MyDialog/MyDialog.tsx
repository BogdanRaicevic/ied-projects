import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

export default function MyDialog(props) {
  return (
    <Dialog fullScreen open={props.open} onClose={props.handleClose}>
      <DialogTitle align="center" variant="h4" boxShadow={10} zIndex={999}>
        Nova Firma
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

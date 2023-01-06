import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MyForm from "../Forms/MyForm/JustForm";
import Divider from "@mui/material/Divider";

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

export default function MyModal({ modalTitle, buttonText, content, formMetadata }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <div>
      <Button size="large" fullWidth variant="outlined" onClick={handleOpen}>
        {buttonText}
      </Button>
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
              {modalTitle}
            </Typography>
            <Divider sx={{ mb: 4 }} />
            {<MyForm formMetadata={formMetadata} formData={content} />}
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

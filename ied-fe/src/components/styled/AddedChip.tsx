import Chip from "@mui/material/Chip";
import { green } from "@mui/material/colors";
import { styled } from "@mui/material/styles";

const AddedChip = styled(Chip)(() => ({
  backgroundColor: green[100],
  color: green[900],
  fontWeight: 600,
  textTransform: "uppercase",
}));

export default AddedChip;

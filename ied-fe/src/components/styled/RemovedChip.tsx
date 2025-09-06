import Chip from "@mui/material/Chip";
import { red } from "@mui/material/colors";
import { styled } from "@mui/material/styles";

const RemovedChip = styled(Chip)(() => ({
  backgroundColor: red[100],
  color: red[900],
  fontWeight: 600,
  textTransform: "uppercase",
}));

export default RemovedChip;

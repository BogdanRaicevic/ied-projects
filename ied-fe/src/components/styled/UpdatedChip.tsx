import Chip from "@mui/material/Chip";
import { orange } from "@mui/material/colors";
import { styled } from "@mui/material/styles";

const UpdatedChip = styled(Chip)(() => ({
  backgroundColor: orange[100],
  color: orange[900],
  fontWeight: 600,
  textTransform: "uppercase",
}));

export default UpdatedChip;

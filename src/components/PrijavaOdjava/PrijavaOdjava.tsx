import { Stack } from "@mui/system";
import { styled } from "@mui/material/styles";
import { Switch, Typography } from "@mui/material";

export default function () {
  const CustomSwitch = styled(Switch)(() => ({
    padding: 8,
    "& .MuiSwitch-track": {
      borderRadius: 22 / 2,
      "&:before, &:after": {
        content: '""',
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: 16,
        height: 16,
      },
      "&:before": {
        left: 12,
      },
      "&:after": {
        right: 12,
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "none",
      width: 16,
      height: 16,
      margin: 2,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: "red",
      "& + .MuiSwitch-track": {
        backgroundColor: "orange",
        opacity: 0.5,
        border: 0,
      },
    },
  }));

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography>Prijavljen</Typography>
      <CustomSwitch />
      <Typography>Odjavljen</Typography>
    </Stack>
  );
}

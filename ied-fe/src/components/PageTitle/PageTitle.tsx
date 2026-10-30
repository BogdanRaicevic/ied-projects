import { Typography } from "@mui/material";

export default function PageTitle({ title }: any) {
  return (
    <Typography variant="h2" align="center" sx={{ my: 3 }}>
      {title}
    </Typography>
  );
}

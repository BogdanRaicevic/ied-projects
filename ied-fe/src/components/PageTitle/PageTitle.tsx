import { Typography } from "@mui/material";

export default function PageTitle({ title }: any) {
  return (
    <Typography variant="h2" my={3} align="center">
      {title}
    </Typography>
  );
}

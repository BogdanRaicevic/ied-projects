import { Stack, Switch, Typography } from "@mui/material";

export default function PrijavaOdjava({
  prijavljeniValue,
  prijavaChange,
}: {
  prijavljeniValue: boolean;
  prijavaChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography>Odjavljeni</Typography>
      <Switch onChange={prijavaChange} checked={prijavljeniValue} />
      <Typography>Prijavljeni</Typography>
    </Stack>
  );
}

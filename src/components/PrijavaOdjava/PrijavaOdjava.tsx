import { Stack } from "@mui/system";
import { Switch, Typography } from "@mui/material";

export default function ({
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

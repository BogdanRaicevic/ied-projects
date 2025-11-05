import { Box, FormLabel, Switch } from "@mui/material";

type MailingListSwitchProps = {
  isPrijavljen: boolean;
  onChange: (newValue: boolean) => void;
};

export const MailingListSwitch: React.FC<MailingListSwitchProps> = ({
  isPrijavljen,
  onChange,
}) => {
  const prijavljeni = "prijavljeni" as const;
  const odjavljeni = "odjavljeni" as const;

  const odjavaColor = isPrijavljen ? "gray" : "darkred";
  const odjavaText = isPrijavljen ? odjavljeni : odjavljeni.toUpperCase();
  const prijavaColor = isPrijavljen ? "green" : "gray";
  const prijavaText = isPrijavljen ? prijavljeni.toUpperCase() : prijavljeni;

  return (
    <Box sx={{ m: 1, display: "flex", alignItems: "center" }}>
      <FormLabel component="legend">Mejling lista</FormLabel>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <FormLabel
          sx={{
            m: 1,
            color: odjavaColor,
            width: 100,
            textAlign: "right",
            fontWeight: !isPrijavljen ? "bold" : "normal",
          }}
        >
          {odjavaText}
        </FormLabel>
        <Switch
          checked={isPrijavljen || false}
          onChange={(e) => onChange(e.target.checked)}
          color="success"
        />
        <FormLabel
          sx={{
            m: 1,
            color: prijavaColor,
            width: 100,
            textAlign: "left",
            fontWeight: isPrijavljen ? "bold" : "normal",
          }}
        >
          {prijavaText}
        </FormLabel>
      </Box>
    </Box>
  );
};

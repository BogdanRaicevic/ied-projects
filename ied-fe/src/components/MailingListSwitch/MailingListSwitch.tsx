import { Box, FormLabel, Switch } from "@mui/material";
import {
  isPermanent,
  MAILING_STATUS,
  MAILING_STATUS_LABEL,
  type MailingStatus,
} from "ied-shared";

type MailingListSwitchProps = {
  status: MailingStatus;
  hasEmail: boolean;
  onChange: (newValue: boolean) => void;
};

export const MailingListSwitch: React.FC<MailingListSwitchProps> = ({
  status,
  hasEmail,
  onChange,
}) => {
  const isPrijavljen = status === MAILING_STATUS.SUBSCRIBED;
  const prijavljeni = "prijavljeni" as const;
  // Bounce / spam show their own label in place of "odjavljeni".
  const odjavljeni = isPermanent(status)
    ? MAILING_STATUS_LABEL[status].toLowerCase()
    : "odjavljeni";

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
          checked={isPrijavljen}
          disabled={!hasEmail || isPermanent(status)}
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
        {!hasEmail && <FormLabel sx={{ m: 1 }}>nema email</FormLabel>}
      </Box>
    </Box>
  );
};

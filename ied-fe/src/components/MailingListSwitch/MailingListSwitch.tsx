import { Box, Chip, FormLabel, Switch } from "@mui/material";
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

const STATUS_COLOR = {
  SUBSCRIBED: "success",
  UNSUBSCRIBED: "warning",
  HARD_BOUNCE: "error",
  SPAM_COMPLAINT: "error",
} as const satisfies Record<MailingStatus, string>;

// One row: the status chip, plus the switch only when it can change
// something (not without an email, not for permanent bounce / spam).
export const MailingListSwitch: React.FC<MailingListSwitchProps> = ({
  status,
  hasEmail,
  onChange,
}) => (
  <Box sx={{ m: 1, display: "flex", alignItems: "center", gap: 1 }}>
    <FormLabel>Mejling lista</FormLabel>
    {hasEmail ? (
      <Chip
        size="small"
        label={MAILING_STATUS_LABEL[status]}
        color={STATUS_COLOR[status]}
      />
    ) : (
      <Chip size="small" label="Nema email" />
    )}
    {hasEmail && !isPermanent(status) && (
      <Switch
        checked={status === MAILING_STATUS.SUBSCRIBED}
        onChange={(e) => onChange(e.target.checked)}
        color="success"
        slotProps={{ input: { "aria-label": "Prijavljen na mejling listu" } }}
      />
    )}
  </Box>
);

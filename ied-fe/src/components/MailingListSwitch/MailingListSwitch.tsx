import {
  Box,
  Chip,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  isPermanent,
  MAILING_STATUS,
  MAILING_STATUS_LABEL,
  type MailingStatus,
  type SettableMailingStatus,
} from "ied-shared";

type MailingListSwitchProps = {
  status: MailingStatus;
  hasEmail: boolean;
  isPending: boolean;
  onChange: (status: SettableMailingStatus) => void;
};

const OPTIONS = [
  { status: MAILING_STATUS.SUBSCRIBED, color: "success" },
  { status: MAILING_STATUS.INACTIVE, color: "info" },
  { status: MAILING_STATUS.UNSUBSCRIBED, color: "warning" },
  { status: MAILING_STATUS.HARD_BOUNCE, color: "error" },
  { status: MAILING_STATUS.SPAM_COMPLAINT, color: "error" },
] as const satisfies { status: MailingStatus; color: string }[];

// Spam is never picked by hand, and once set it locks the whole control.
export const MailingListSwitch: React.FC<MailingListSwitchProps> = ({
  status,
  hasEmail,
  isPending,
  onChange,
}) => (
  <Box sx={{ m: 1, display: "flex", alignItems: "center", gap: 1 }}>
    <FormLabel>Mejling lista</FormLabel>
    {hasEmail ? (
      <ToggleButtonGroup
        size="small"
        exclusive
        value={status}
        disabled={isPending || isPermanent(status)}
        // exclusive emits null when the selected button is clicked again
        onChange={(_, next: SettableMailingStatus | null) => {
          if (next) onChange(next);
        }}
        aria-label="Status na mejling listi"
      >
        {OPTIONS.map((o) => (
          <ToggleButton
            key={o.status}
            value={o.status}
            color={o.color}
            disabled={isPermanent(o.status) || undefined}
          >
            {MAILING_STATUS_LABEL[o.status]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    ) : (
      <Chip size="small" label="Nema email" />
    )}
  </Box>
);

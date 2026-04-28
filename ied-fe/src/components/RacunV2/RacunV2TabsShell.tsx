import { Box, Tab, Tabs, Tooltip } from "@mui/material";
import { TipRacuna } from "ied-shared";

export type RacunV2Tab = TipRacuna | "pretrage";

type Props = {
  currentTab: RacunV2Tab;
  onTabChange: (tab: TipRacuna) => void;
};

export function RacunV2TabsShell({ currentTab, onTabChange }: Props) {
  const handleChange = (_event: React.SyntheticEvent, newValue: RacunV2Tab) => {
    if (newValue === "pretrage") {
      return;
    }
    onTabChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        aria-label="Tipovi racuna V2"
      >
        <Tooltip title="Uskoro" placement="top">
          <span>
            <Tab label="Pretrage" value="pretrage" disabled />
          </span>
        </Tooltip>
        <Tab label="Predračun" value={TipRacuna.PREDRACUN} />
        <Tab label="Avansni račun" value={TipRacuna.AVANSNI_RACUN} />
        <Tab label="Konačni račun" value={TipRacuna.KONACNI_RACUN} />
        <Tab label="Račun" value={TipRacuna.RACUN} />
      </Tabs>
    </Box>
  );
}

import { Card, CardContent, Typography, List, ListItem } from "@mui/material";
import { Box } from "@mui/system";
import { ZaposleniForm } from "./ZaposleniFrom";

type Seminar_Zaposleni = {
  naziv: string;
  predavac: string;
  datum: string;
  id: string;
};

type Zaposleni = {
  ime: string;
  prezime: string;
  email: string;
  brojSertifikata?: string | undefined;
  komentari?: string | undefined;
  radnaMesta: string[];
  id: string;
  seminari?: Seminar_Zaposleni[];
  telefon: string;
  zeleMarketingMaterijal: boolean;
};

export function SingleZaposleni(zaposleni: Zaposleni) {
  const renderVisitedSeminari = (seminari: Seminar_Zaposleni[]) => {
    return (
      <List>
        {seminari.map((seminar, index) => (
          <ListItem key={index}>{seminar.naziv}</ListItem>
        ))}
      </List>
    );
  };

  return (
    <Box paddingBottom={5}>
      <ZaposleniForm zaposleni={zaposleni as any}></ZaposleniForm>

      <Card>
        <CardContent>
          <Typography>Poseceni seminari:</Typography>
          {renderVisitedSeminari(zaposleni.seminari ?? [])}
        </CardContent>
      </Card>
    </Box>
  );
}

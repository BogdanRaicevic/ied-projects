import { Card, CardContent, Typography, List, ListItem } from "@mui/material";
import { Box } from "@mui/system";
import { ZaposleniForm } from "./ZaposleniFrom";
import PrijavaOdjava from "../PrijavaOdjava";
import { useState } from "react";

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

  const [zaposleniPrijava, setZaposleniPrijava] = useState<Zaposleni>(zaposleni);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZaposleniPrijava({ ...zaposleniPrijava, zeleMarketingMaterijal: event.target.checked });
  };

  return (
    <Box paddingBottom={5}>
      <PrijavaOdjava
        prijavljeniValue={zaposleniPrijava.zeleMarketingMaterijal}
        prijavaChange={handleChange}
      />
      {
        // TODO: Fix zaposleni form missing on submit
      }
      <ZaposleniForm
        isCompanyBeingUpdated
        onSubmit={() => {}}
        zaposleni={zaposleni as any}
      ></ZaposleniForm>

      <Card>
        <CardContent>
          <Typography>Poseceni seminari:</Typography>
          {renderVisitedSeminari(zaposleni.seminari ?? [])}
        </CardContent>
      </Card>
    </Box>
  );
}

import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Box,
} from "@mui/material";
import { ZaposleniForm } from "./ZaposleniFrom";
import PrijavaOdjava from "../PrijavaOdjava";
import { useState } from "react";
import type { TODO_ANY } from "../../../../ied-be/src/utils/utils";

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

  const [zaposleniPrijava, setZaposleniPrijava] =
    useState<Zaposleni>(zaposleni);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZaposleniPrijava({
      ...zaposleniPrijava,
      zeleMarketingMaterijal: event.target.checked,
    });
  };

  return (
    <Box paddingBottom={5}>
      <PrijavaOdjava
        prijavljeniValue={zaposleniPrijava.zeleMarketingMaterijal}
        prijavaChange={handleChange}
      />

      <ZaposleniForm onSubmit={() => ""} zaposleni={zaposleni as TODO_ANY} />

      <Card>
        <CardContent>
          <Typography>Poseceni seminari:</Typography>
          {renderVisitedSeminari(zaposleni.seminari ?? [])}
        </CardContent>
      </Card>
    </Box>
  );
}

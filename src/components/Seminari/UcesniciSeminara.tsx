import { Card, CardContent, Typography, List, ListItem } from "@mui/material";
import { Box } from "@mui/system";

type SingleSeminar = {
  id: string;
  naziv: string;
  datum: string;
  predavac: string;
  tipSeminara: string;
  maloprodajnaCena: number;
  mesto: string;
  ucesnici: {
    naziv: string;
    id: string;
    zaposleni: {
      id: string;
      ime: string;
      prezime: string;
      email: string;
    }[];
  }[];
};

export function UcesniciSeminara(item: SingleSeminar) {
  const renderUcesnikeZaposlene = (firmaUcesnik: any) => {
    const a = firmaUcesnik.zaposleni.map((zaposleni: any, index: number) => {
      return (
        <List key={index}>
          <ListItem>
            <Typography>{zaposleni.ime + " " + zaposleni.prezime}</Typography>
            <Typography sx={{ paddingLeft: 10 }}>{zaposleni.email}</Typography>
          </ListItem>
        </List>
      );
    });

    return a;
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography>Ucesnici</Typography>
        {item.ucesnici.map((ucesnik: any, index: number) => {
          return (
            <List key={index}>
              <Box>
                <Typography>{ucesnik.naziv}</Typography>
                {renderUcesnikeZaposlene(ucesnik)}
              </Box>
            </List>
          );
        })}
        <List>
          <ListItem>
            <Card>
              <Typography></Typography>
            </Card>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}

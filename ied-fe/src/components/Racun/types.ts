export type PrimalacRacuna = {
  naziv: string;
  adresa: string;
  pib: number | string;
  mesto: string;
  maticniBroj: number | string;
  onlineCena: number | string;
  offlineCena: number | string;
  brojUcesnikaOnline: number | string;
  brojUcesnikaOffline: number | string;
  ukupanBrojUcesnika: number | string;
  nazivSeminara?: string;
};

export type IzdavacRacuna = {
  naziv: string;
  kontaktTelefoni: string[];
  pib: string;
  maticniBroj: string;
  brojResenjaOEvidencijiZaPDV: string;
  tekuciRacuni: string[];
};

export type IzdavacRacunaForm = {
  naziv: string;
  kontaktTelefoni: string[];
  pib: string;
  maticniBroj: string;
  brojResenjaOEvidencijiZaPDV: string;
  tekuciRacun: string;
};

export type Racun = PrimalacRacuna & {
  popustOnline: number | string;
  popustOffline: number | string;
  stopaPdv: number | string;
  pdvOffline: number;
  pdvOnline: number;
  onlineUkupnaNaknada: number;
  offlineUkupnaNaknada: number;
  onlinePoreskaOsnovica: number;
  offlinePoreskaOsnovica: number;
  jedinicaMere: string;
  rokZaUplatu: number;
  pozivNaBroj: string;
  ukupnaNaknada: number;
  ukupanPdv: number;
  izdavacRacuna: IzdavacRacunaForm;
};

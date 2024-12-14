export type SeminarQueryParams = {
  naziv?: string;
  lokacija?: string;
  predavac?: string;
  datumOd?: Date | string;
  datumDo?: Date | string;
  datum?: Date | string;
  cena?: string;
  cenaOd?: string;
  cenaDo?: string;
  brojUcesnika?: string;
  brojUcesnikaOd?: string;
  brojUcesnikaDo?: string;
};

export type SaveSeminarParams = {
  naziv: string;
  predavac?: string;
  lokacija?: string;
  onlineCena?: string;
  offlineCena?: string;
  datum?: string;
};

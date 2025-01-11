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
	prijava?: PrijavaNaSeminar;
	_id?: string;
};

type PrijavaNaSeminar = {
	seminar_id: string;
	firma_id: string;
	firma_naziv: string;
	firma_email: string;
	firma_telefon: string;
	zaposleni_id: string;
	zaposleni_ime: string;
	zaposleni_prezime: string;
	zaposleni_email: string;
	zaposleni_telefon: string;
	prisustvo: "online" | "offline" | "ne znam";
	_id?: string;
};

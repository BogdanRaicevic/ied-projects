export type FirmaQueryParams = {
	imeFirme?: string;
	pib?: string;
	email?: string;
	mesta?: string[];
	delatnosti?: string[];
	tipoviFirme?: string[];
	radnaMesta?: string[];
	velicineFirmi?: string[];
	negacije?: string[];
	stanjaFirme?: string[];
	jbkjs?: string;
	maticniBroj?: string;
	komentar?: string;
	seminari?: { _id: string; naziv: string; datum: string | Date }[];
};

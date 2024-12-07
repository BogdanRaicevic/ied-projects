import { createSeminarQuery } from "../utils/seminariQueryBuilder";
import { Seminar } from "./../models/seminar.model";

export const saveSeminar = async ({
  naziv,
  predavac,
  lokacija,
  cena,
  datum,
}: {
  naziv: string;
  predavac?: string;
  lokacija?: string;
  cena?: string;
  datum?: string;
}) => {
  try {
    if (!naziv) {
      console.log("Seminar must contain a have name");
      return;
    }
    await Seminar.create({ naziv, predavac, lokacija, cena, datum });
    console.log("Created seminar:", naziv, predavac, lokacija, cena, datum);
  } catch (error) {
    console.log("Error saving seminar", error);
    throw new Error("Error saving seminar");
  }
};

export const searchSeminari = async ({
  naziv,
  predavac,
  lokacija,
  datumOd,
  datumDo,
}: {
  naziv: string;
  predavac: string;
  lokacija: string;
  datumOd: string;
  datumDo: string;
}) => {
  try {
    const mongoQuery = createSeminarQuery({
      naziv,
      predavac,
      lokacija,
      datumOd,
      datumDo,
    });

    const result = Seminar.find(mongoQuery, {
      naziv: 1,
      predavac: 1,
      lokacija: 1,
      cena: 1,
      datum: 1,
      _id: 1,
    }).exec();

    return result;
  } catch (error) {
    console.log("Error saving seminari", error);
    throw new Error("Error saving seminari");
  }
};

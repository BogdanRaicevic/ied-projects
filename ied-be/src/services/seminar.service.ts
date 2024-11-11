import { createSeminarQuery } from "../utils/seminariQueryBuilder";
import { Seminar } from "./../models/seminar.model";

export const saveSeminar = async ({
  naziv,
  predavac,
  lokacija,
}: {
  naziv: string;
  predavac: string;
  lokacija: string;
}) => {
  try {
    await Seminar.create({ naziv, predavac, lokacija });
  } catch (error) {
    console.log("Error saving seminari", error);
    throw new Error("Error saving seminari");
  }
};

export const searchSeminari = async ({
  naziv,
  predavac,
  lokacija,
}: {
  naziv: string;
  predavac: string;
  lokacija: string;
}) => {
  try {
    const mongoQuery = createSeminarQuery({ naziv, predavac, lokacija });

    const result = Seminar.find(mongoQuery, {
      naziv: 1,
      predavac: 1,
      lokacija: 1,
      _id: 0,
    }).exec();

    return result;
  } catch (error) {
    console.log("Error saving seminari", error);
    throw new Error("Error saving seminari");
  }
};

import { Seminari } from "./../models/seminar.model";

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
    await Seminari.create({ naziv, predavac, lokacija });
  } catch (error) {
    console.log("Error saving seminari", error);
    throw new Error("Error saving seminari");
  }
};

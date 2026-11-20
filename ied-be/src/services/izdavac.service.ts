import type { IzdavacRacuna, IzdavacType } from "ied-shared";
import { Izdavac } from "../models/izdavac.model";

export const getIzdavaci = (): Promise<IzdavacType[]> =>
  Izdavac.find().sort({ _id: 1 }).lean();

export const getIzdavac = async (
  sifra: IzdavacRacuna,
): Promise<IzdavacType> => {
  const izdavac = await Izdavac.findOne({ sifra: { $eq: sifra } }).lean();
  if (!izdavac) {
    throw new Error(
      `Izdavac "${sifra}" is missing from the izdavaci collection.`,
    );
  }
  return izdavac;
};

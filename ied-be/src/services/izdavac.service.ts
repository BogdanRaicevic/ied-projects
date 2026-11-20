import type { IzdavacRacuna, IzdavacType } from "ied-shared";
import { Izdavac } from "../models/izdavac.model";

export const getIzdavaci = (): Promise<IzdavacType[]> =>
  Izdavac.find().sort({ _id: 1 }).lean();

export const getIzdavac = async (id: IzdavacRacuna): Promise<IzdavacType> => {
  const izdavac = await Izdavac.findOne({ id: { $eq: id } }).lean();
  if (!izdavac) {
    throw new Error(
      `Izdavac "${id}" is missing from the izdavaci collection. Paste it from constants/izdavacRacuna.const.ts.`,
    );
  }
  return izdavac;
};

import type { FirmaQueryParams } from "@ied-shared/types/firma.zod";
import { Pretrage, type PretrageType } from "../models/pretrage.model";
import { validateMongoId } from "../utils/utils";

export const getAllPretrage = async () => {
  try {
    const result = await Pretrage.find({}).exec();
    return result.map((item) => item);
  } catch (error) {
    console.log("Error finding pretrage", error);
    throw new Error("Error finding pretrage");
  }
};

export const savePretraga = async (
  queryParameters: FirmaQueryParams,
  pretraga: { id?: string; naziv: string },
) => {
  try {
    const pretragaData: Partial<PretrageType> = {};
    pretragaData.naziv_pretrage = pretraga.naziv || "pretraga bez imena";

    pretragaData.mesta = queryParameters.mesta;
    pretragaData.delatnosti = queryParameters.delatnosti;
    pretragaData.velicine_firme = queryParameters.velicineFirmi;
    pretragaData.radna_mesta = queryParameters.radnaMesta;
    pretragaData.tipovi_firme = queryParameters.tipoviFirme;

    pretragaData.ime_firme = queryParameters.imeFirme;
    pretragaData.email = queryParameters.email;
    pretragaData.pib = queryParameters.pib;

    pretragaData.negacije = queryParameters.negacije;
    pretragaData.stanja_firme = queryParameters.stanjaFirme;
    pretragaData.jbkjs = queryParameters.jbkjs;
    pretragaData.maticni_broj = queryParameters.maticniBroj;
    pretragaData.komentar = queryParameters.komentar;
    pretragaData.imePrezime = queryParameters.imePrezime;
    pretragaData.emailZaposlenog = queryParameters.emailZaposlenog;

    const p = await Pretrage.findOneAndUpdate(
      { _id: pretraga.id },
      { $set: pretragaData },
      { new: true, runValidators: true },
    );

    if (!p) {
      await Pretrage.create(pretragaData);
    }
    console.log("Pretraga saved successfully");
  } catch (error) {
    console.log("Error saving pratraga", error);
    throw new Error("Error saving pretraga");
  }
};

export const deletePretraga = async (id: string) => {
  try {
    validateMongoId(id);
    await Pretrage.findByIdAndDelete({ _id: id });
  } catch (error) {
    console.log("Error deleting pretraga", error);
    throw new Error("Error deleting pretraga");
  }
};

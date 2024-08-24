import { FirmaQueryParams } from "../utils/firmaQueryBuilder";
import { Pretrage, PretrageType } from "../models/pretrage.model";

export const getAllPretrage = async () => {
  try {
    const result = await Pretrage.find({}).exec();
    console.log("result", result);
    return result.map((item) => item);
  } catch (error) {
    console.log("Error finding pretrage", error);
    throw new Error("Error finding pretrage");
  }
};

export const savePretraga = async (queryParameters: FirmaQueryParams) => {
  try {
    let pretragaData: Partial<PretrageType> = {};
    pretragaData.naziv_pretrage = "test";

    pretragaData.mesta = queryParameters.mesta;
    pretragaData.delatnosti = queryParameters.delatnosti;
    pretragaData.velicine_firme = queryParameters.velicineFirmi;
    pretragaData.radna_mesta = queryParameters.radnaMesta;
    pretragaData.tipovi_firme = queryParameters.tipoviFirme;

    pretragaData.ime_firme = queryParameters.imeFirme;
    pretragaData.email = queryParameters.email;
    pretragaData.pib = queryParameters.pib;

    pretragaData.negacije = queryParameters.negacije;

    await Pretrage.create(pretragaData);
    console.log("Pretraga saved successfully");
  } catch (error) {
    console.log("Error saving pratraga", error);
    throw new Error("Error saving pretraga");
  }
};

import { FilterQuery } from "mongoose";
import { FirmaType, Firma } from "../models/firma.model";

export const findByFirmaId = async (ID_firma: number) => {
  try {
    return Firma.findOne({ ID_firma });
  } catch (error) {
    console.log("Error finding firma by od firma id:", error);
    throw new Error("Error finding firma by od firma id");
  }
};

export const findById = async (ID_firma: string): Promise<FirmaType | null> => {
  return await Firma.findOne({ ID_firma });
};

export const deleteById = async (id: string): Promise<FirmaType | null> => {
  return await Firma.findByIdAndDelete(id).exec();
};

export const create = async (firmaData: Partial<FirmaType>): Promise<FirmaType> => {
  const firma = new Firma(firmaData);
  return await firma.save();
};

export const updateById = async (
  id: string,
  firmaData: Partial<FirmaType>
): Promise<FirmaType | null> => {
  return await Firma.findByIdAndUpdate(id, firmaData, { new: true }).exec();
};

export const search = async (
  query: FilterQuery<FirmaType>,
  page: number = 1,
  pageSize: number = 100
) => {
  const skip = (page - 1) * pageSize;

  if (query.naziv_firme) {
    query.naziv_firme = { $regex: query.naziv_firme, $options: "i" }; // 'i' for case-insensitive
  }

  return Firma.find(query).skip(skip).limit(pageSize).cursor();
};

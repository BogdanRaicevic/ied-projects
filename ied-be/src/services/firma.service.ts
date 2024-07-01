import { FilterQuery } from "mongoose";
import { FirmaType, Firma } from "../models/firma.model";
import { createFirmaQuery } from "../utils/firmaQueryBuilder";

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
  queryParameters: FilterQuery<FirmaType>,
  pageIndex: number = 1,
  pageSize: number = 10
) => {
  console.log(queryParameters);
  const skip = (pageIndex - 1) * pageSize;
  const mongoQuery = createFirmaQuery(queryParameters);

  const totalDocuments = await Firma.countDocuments();

  return {
    courser: Firma.find(mongoQuery, { zaposleni: 0 }).skip(skip).limit(pageSize).cursor(),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / pageSize),
  };
};

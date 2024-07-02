import { FilterQuery } from "mongoose";
import { FirmaType, Firma } from "../models/firma.model";
import { createFirmaQuery } from "../utils/firmaQueryBuilder";
import { createWriteStream } from "fs";

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

export const exportSearchedFirmaData = async (
  queryParameters: FilterQuery<FirmaType>,
  filePath: string
) => {
  const mongoQuery = {
    ...createFirmaQuery(queryParameters),
    e_mail: { $ne: "nema" }, // Exclude documents where e_mail is "nema"
  };

  console.log("mongo query: ", mongoQuery);

  // Create a readable stream from the database with only "naziv_firme" and "e_mail" properties
  const cursor = Firma.find(mongoQuery, { naziv_firme: 1, e_mail: 1, _id: 0 }).cursor();

  // Create a writable stream to a file
  const writableStream = createWriteStream(filePath);

  // Write CSV header
  writableStream.write("naziv_firme,e_mail\n");

  // Write the data to the writable stream
  cursor.on("data", (doc) => {
    const plainObject = doc.toObject();
    const csvRow = `${plainObject.naziv_firme},${plainObject.e_mail}\n`;
    writableStream.write(csvRow);
  });

  return new Promise<void>((resolve, reject) => {
    cursor.on("end", () => {
      writableStream.end();
      console.log("Data has been written to the file successfully.");
      resolve();
    });

    cursor.on("error", (err) => {
      console.error("Error reading data from the database:", err);
      reject(err);
    });

    writableStream.on("error", (err) => {
      console.error("Error writing data to the file:", err);
      reject(err);
    });
  });
};

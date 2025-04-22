import { Racun } from "../models/racun.model";

export const saveRacun = async (racun: Partial<Racun>) => {
  const newRacun = new Racun(racun);
  await newRacun.save();
  return newRacun;
};

export const getRacunById = async (id: string) => {
  const racun = await Racun.findById(id);
  return racun;
};

export const updateRacunById = async (id: string, updatedRacun: Partial<Racun>) => {
  const racun = await Racun.findByIdAndUpdate(id, updatedRacun, { new: true });
  return racun;
};

export const deleteRacunById = async (id: string) => {
  const racun = await Racun.findByIdAndDelete(id);
  return racun;
};

export const getAllRacuni = async (pageIndex = 1, pageSize = 50) => {
  const skip = (pageIndex - 1) * pageSize;
  const totalDocuments = await Racun.countDocuments();

  return {
    cursor: Racun.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize).cursor(),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / pageSize),
  };
};

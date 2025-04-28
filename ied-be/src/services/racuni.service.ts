import { Racun } from "../models/racun.model";

export const saveRacun = async (racun: Partial<Racun>) => {
  try {
    const newRacun = new Racun(racun);
    console.log("Saving Racun:", newRacun);
    await newRacun.save();
    return newRacun;
  } catch (error) {
    console.error("Error saving Racun:", error);
    throw error;
  }
};

export const getRacunById = async (id: string) => {
  try {
    const racun = await Racun.findById(id);
    // Optional: Check if racun exists and throw a specific error if not found
    if (!racun) {
      throw new Error(`Racun with ID ${id} not found.`);
    }
    return racun;
  } catch (error) {
    console.error(`Error getting Racun by ID ${id}:`, error);
    throw error;
  }
};

export const updateRacunById = async (id: string, updatedRacun: Partial<Racun>) => {
  try {
    // Add { runValidators: true } to ensure updates also adhere to schema validation
    const racun = await Racun.findByIdAndUpdate(id, updatedRacun, {
      new: true,
      runValidators: true,
    });
    // Optional: Check if racun was found and updated
    if (!racun) {
      throw new Error(`Racun with ID ${id} not found for update.`);
    }
    return racun;
  } catch (error) {
    console.error(`Error updating Racun by ID ${id}:`, error);
    throw error;
  }
};

export const deleteRacunById = async (id: string) => {
  try {
    const racun = await Racun.findByIdAndDelete(id);
    return racun;
  } catch (error) {
    console.error(`Error deleting Racun by ID ${id}:`, error);
    throw error;
  }
};

export const getAllRacuni = async (pageIndex = 1, pageSize = 50) => {
  try {
    const skip = (pageIndex - 1) * pageSize;
    // Use Promise.all to run count and find potentially in parallel
    const [totalDocuments, resultsCursor] = await Promise.all([
      Racun.countDocuments(),
      Racun.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize).cursor(),
    ]);

    return {
      cursor: resultsCursor,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / pageSize),
    };
  } catch (error) {
    console.error("Error getting all Racuni:", error);
    throw error;
  }
};

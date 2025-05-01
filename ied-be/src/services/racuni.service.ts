import { Racun } from "../models/racun.model";

export const saveRacun = async (racun: Racun) => {
  try {
    const newRacun = new Racun(racun);
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
    if (!racun) {
      throw new Error(`Racun with ID ${id} not found.`);
    }
    return racun;
  } catch (error) {
    console.error(`Error getting Racun by ID ${id}:`, error);
    throw error;
  }
};

export const updateRacunById = async (id: string, updatedRacun: Racun) => {
  try {
    const racun = await Racun.findByIdAndUpdate(id, updatedRacun, {
      new: true,
      runValidators: true,
    });
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

// TODO: queryParmaeters: RacuniQueryParamsZodType
export const searchRacuni = async (pageIndex = 1, pageSize = 50, _queryParameters: any) => {
  try {
    const skip = (pageIndex - 1) * pageSize;
    // const mongoQuery = createRacunQuery(queryParameters.queryParameters);
    const [totalDocuments, racuni] = await Promise.all([
      Racun.countDocuments(),
      Racun.find().sort({ pozivNaBroj: -1 }).skip(skip).limit(pageSize),
    ]);

    const totalPages = Math.ceil(totalDocuments / pageSize);

    return {
      racuni,
      totalDocuments,
      totalPages,
    };
  } catch (error) {
    console.error("Error getting all Racuni:", error);
    throw error;
  }
};

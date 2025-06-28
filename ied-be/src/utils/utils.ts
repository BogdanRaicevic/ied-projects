import mongoose from "mongoose";

// biome-ignore lint/suspicious:noExplicitAny: This is global ANY that will be removed later in a refactor
export type TODO_ANY = any;

export const validateMongoId = (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ID: ${id}`);
  }
};

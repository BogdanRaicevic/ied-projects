import mongoose from "mongoose";
import { env } from "../utils/envVariables";
import type { TODO_ANY } from "../utils/utils";

const uri = env.mongo.uri ?? "";
let dbConnection: TODO_ANY;

export async function connectDB() {
  if (!dbConnection) {
    try {
      await mongoose.connect(uri);
      console.log("Database connected");
    } catch (error) {
      console.error("Error connecting to the database", error);
      throw new Error("Error connecting to the database");
    }
    dbConnection = mongoose.connection;
    dbConnection.on("error", console.error.bind(console, "connection error:"));
    dbConnection.once("open", () => {
      console.log("Database connected!");
    });
  }
  return dbConnection; // Return the connection instance
}

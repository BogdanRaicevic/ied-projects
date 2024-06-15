import { env } from "./utils/envVariables";
import { connectDB } from "./database/db";
import express from "express";
import cors from "cors";

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "*", // Allow all origins in development
      credentials: true, // Reflect CORS headers in responses
    })
  );
} else {
  // Production environment CORS policy
  // Replace '*' with your specific allowed origins
  app.use(
    cors({
      origin: ["http://localhost:8000", "https://localhost:5173"],
      credentials: true,
    })
  );
}

// Wrap the initialization logic in an async function
async function initServer() {
  try {
    await connectDB();
    await app.listen({ port: Number(env.be.appPort) });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

initServer()
  .then(() => console.log("Server is up"))
  .catch(console.error);

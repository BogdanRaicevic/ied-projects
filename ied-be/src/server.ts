import { env } from "./utils/envVariables";
import { connectDB } from "./database/db";
import express from "express";
import cors from "cors";
import firmaRoutes from "./routes/firma.routes";
import velicineFirmiRoutes from "./routes/velicina_firme.routes";
import radnaMestaRoutes from "./routes/radna_mesta.routes";
import { errorWrapper } from "./middleware/errorWrapper";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
  })
);

// if (process.env.NODE_ENV === "development") {
//   app.use(
//     cors({
//       origin: "*", // Allow all origins in development
//       credentials: true, // Reflect CORS headers in responses
//     })
//   );
// } else {
//   // Production environment CORS policy
//   // Replace '*' with your specific allowed origins
//   app.use(
//     cors({
//       origin: ["http://localhost:8000", "https://localhost:5173"],
//       credentials: true,
//     })
//   );
// }
app.use(express.json());

// Wrap the initialization logic in an async function

app.use("/api/firma", firmaRoutes);
app.use("/api/velicine-firmi", velicineFirmiRoutes);
app.use("/api/radna-mesta", radnaMestaRoutes);
app.use(errorWrapper);

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

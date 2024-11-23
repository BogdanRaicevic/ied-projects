import { env } from "./utils/envVariables";
import { connectDB } from "./database/db";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import firmaRoutes from "./routes/firma.routes";
import velicineFirmiRoutes from "./routes/velicina_firme.routes";
import radnaMestaRoutes from "./routes/radna_mesta.routes";
import tipFirmeRoutes from "./routes/tip_firme.routes";
import delatnostiRoutes from "./routes/delatnost.routes";
import mestoRoutes from "./routes/mesto.routes";
import pretrageRoutes from "./routes/pretrage.routes";
import stanjaFirmeRoutes from "./routes/stanje_firme.routes";
import seminarRoutes from "./routes/seminari.routes";
import testRoutes from "./routes/test.routes";
import { errorWrapper } from "./middleware/errorWrapper";
import { clerkMiddleware, getAuth } from "@clerk/express";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  clerkMiddleware({
    publishableKey: env.clerk.publishableKey,
    secretKey: env.clerk.secretKey,
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

const customRequireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    return res.status(403).send("Forbidden");
  }
  next();
};

app.use("/api/firma", customRequireAuth, firmaRoutes);
app.use("/api/velicine-firmi", customRequireAuth, velicineFirmiRoutes);
app.use("/api/radna-mesta", customRequireAuth, radnaMestaRoutes);
app.use("/api/tip-firme", customRequireAuth, tipFirmeRoutes);
app.use("/api/delatnost", customRequireAuth, delatnostiRoutes);
app.use("/api/mesto", customRequireAuth, mestoRoutes);
app.use("/api/pretrage", customRequireAuth, pretrageRoutes);
app.use("/api/stanja-firmi", customRequireAuth, stanjaFirmeRoutes);
app.use("/api/seminari", customRequireAuth, seminarRoutes);
app.use("/api/test", testRoutes);

app.use(errorWrapper);

async function initServer() {
  try {
    await connectDB();
    app.listen({ port: Number(env.be.appPort) });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

initServer()
  .then(() => console.log("Server is up"))
  .catch(console.error);

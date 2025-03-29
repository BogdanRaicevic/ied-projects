import { env } from "./utils/envVariables.js";
import { connectDB } from "./database/db.js";
import express from "express";
import cors from "cors";
import firmaRoutes from "./routes/firma.routes.js";
import velicineFirmiRoutes from "./routes/velicina_firme.routes.js";
import radnaMestaRoutes from "./routes/radna_mesta.routes.js";
import tipFirmeRoutes from "./routes/tip_firme.routes.js";
import delatnostiRoutes from "./routes/delatnost.routes.js";
import mestoRoutes from "./routes/mesto.routes.js";
import pretrageRoutes from "./routes/pretrage.routes.js";
import stanjaFirmeRoutes from "./routes/stanje_firme.routes.js";
import seminarRoutes from "./routes/seminari.routes.js";
import docxRoutes from "./routes/docx.routes.js";
import testRoutes from "./routes/test.routes.js";
import { errorWrapper } from "./middleware/errorWrapper.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { hasPermission } from "./middleware/hasPermission.js";
import "./database/cron.js";

const app = express();

app.use(
  cors({
    origin: [`${env.fe.appUrl}`],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
    exposedHeaders: ["Authorization"],
  })
);

app.use(
  clerkMiddleware({
    publishableKey: env.clerk.publishableKey,
    secretKey: env.clerk.secretKey,
  })
);

app.use(express.json());

app.use("/api/firma", requireAuth(), hasPermission, firmaRoutes);
app.use("/api/velicine-firmi", requireAuth(), hasPermission, velicineFirmiRoutes);
app.use("/api/radna-mesta", requireAuth(), hasPermission, radnaMestaRoutes);
app.use("/api/tip-firme", requireAuth(), hasPermission, tipFirmeRoutes);
app.use("/api/delatnost", requireAuth(), hasPermission, delatnostiRoutes);
app.use("/api/mesto", requireAuth(), hasPermission, mestoRoutes);
app.use("/api/pretrage", requireAuth(), hasPermission, pretrageRoutes);
app.use("/api/stanja-firmi", requireAuth(), hasPermission, stanjaFirmeRoutes);
app.use("/api/seminari", requireAuth(), hasPermission, seminarRoutes);
app.use("/api/docx", requireAuth(), hasPermission, docxRoutes);
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

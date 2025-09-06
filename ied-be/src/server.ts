import { clerkMiddleware, requireAuth } from "@clerk/express";
import cors from "cors";
import express from "express";
import { connectDB } from "./database/db";
import { errorWrapper } from "./middleware/errorWrapper";
import { hasPermission } from "./middleware/hasPermission";
import delatnostiRoutes from "./routes/delatnost.routes";
import docxRoutes from "./routes/docx.routes";
import firmaRoutes from "./routes/firma.routes";
import mestoRoutes from "./routes/mesto.routes";
import pretrageRoutes from "./routes/pretrage.routes";
import racuniRoutes from "./routes/racuni.routes";
import radnaMestaRoutes from "./routes/radna_mesta.routes";
import seminarRoutes from "./routes/seminari.routes";
import stanjaFirmeRoutes from "./routes/stanje_firme.routes";
import testRoutes from "./routes/test.routes";
import tipFirmeRoutes from "./routes/tip_firme.routes";
import velicineFirmiRoutes from "./routes/velicina_firme.routes";
import { env } from "./utils/envVariables";
import "./database/cron";
import auditLogRoutes from "./routes/audit_log.routes";

const app = express();
const allowedOrigins = env.fe.allowedPorts.map(
  (port) => `${env.fe.appUrl}:${port}`,
);
console.log("Allowed Origins:", allowedOrigins);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
    exposedHeaders: ["Authorization"],
  }),
);

app.use(
  clerkMiddleware({
    publishableKey: env.clerk.publishableKey,
    secretKey: env.clerk.secretKey,
  }),
);

app.use(express.json());

app.use("/api/firma", requireAuth(), hasPermission, firmaRoutes);
app.use(
  "/api/velicine-firmi",
  requireAuth(),
  hasPermission,
  velicineFirmiRoutes,
);
app.use("/api/radna-mesta", requireAuth(), hasPermission, radnaMestaRoutes);
app.use("/api/tip-firme", requireAuth(), hasPermission, tipFirmeRoutes);
app.use("/api/delatnost", requireAuth(), hasPermission, delatnostiRoutes);
app.use("/api/mesto", requireAuth(), hasPermission, mestoRoutes);
app.use("/api/pretrage", requireAuth(), hasPermission, pretrageRoutes);
app.use("/api/stanja-firmi", requireAuth(), hasPermission, stanjaFirmeRoutes);
app.use("/api/seminari", requireAuth(), hasPermission, seminarRoutes);
app.use("/api/docx", requireAuth(), hasPermission, docxRoutes);
app.use("/api/racuni", requireAuth(), hasPermission, racuniRoutes);
app.use("/api/audit-log", requireAuth(), hasPermission, auditLogRoutes);
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

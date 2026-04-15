import { clerkMiddleware } from "@clerk/express";
import * as Sentry from "@sentry/node";
import cors from "cors";
import express from "express";
import { connectDB } from "./database/db";
import { errorWrapper } from "./middleware/errorWrapper";
import { hasPermission } from "./middleware/hasPermission";
import { requireApiAuth } from "./middleware/requireApiAuth";
import delatnostiRoutes from "./routes/delatnost.routes";
import docxRoutes from "./routes/docx.routes";
import firmaRoutes from "./routes/firma.routes";
import mestoRoutes from "./routes/mesto.routes";
import pretrageRoutes from "./routes/pretrage.routes";
import racuniRoutes from "./routes/racuni.routes";
import radnaMestaRoutes from "./routes/radno_mesto.routes";
import seminarRoutes from "./routes/seminari.routes";
import stanjaFirmeRoutes from "./routes/stanje_firme.routes";
import testRoutes from "./routes/test.routes";
import tipFirmeRoutes from "./routes/tip_firme.routes";
import velicineFirmiRoutes from "./routes/velicina_firme.routes";
import { env } from "./utils/envVariables";
import "./database/cron";
import auditLogRoutes from "./routes/audit_log.routes";
import emailSuppressionRoutes from "./routes/email_suppression.routes";
import tipSeminaraRoutes from "./routes/tip_seminara.routes";

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

app.use(express.json({ limit: "1mb" }));

app.use("/api/firma", requireApiAuth, hasPermission, firmaRoutes);
app.use(
  "/api/velicine-firmi",
  requireApiAuth,
  hasPermission,
  velicineFirmiRoutes,
);
app.use("/api/radna-mesta", requireApiAuth, hasPermission, radnaMestaRoutes);
app.use("/api/tip-firme", requireApiAuth, hasPermission, tipFirmeRoutes);
app.use("/api/delatnost", requireApiAuth, hasPermission, delatnostiRoutes);
app.use("/api/mesto", requireApiAuth, hasPermission, mestoRoutes);
app.use("/api/pretrage", requireApiAuth, hasPermission, pretrageRoutes);
app.use("/api/stanja-firmi", requireApiAuth, hasPermission, stanjaFirmeRoutes);
app.use("/api/seminari", requireApiAuth, hasPermission, seminarRoutes);
app.use("/api/docx", requireApiAuth, hasPermission, docxRoutes);
app.use("/api/racuni", requireApiAuth, hasPermission, racuniRoutes);
app.use("/api/audit-log", requireApiAuth, hasPermission, auditLogRoutes);
app.use(
  "/api/email-suppression",
  requireApiAuth,
  hasPermission,
  emailSuppressionRoutes,
);
app.use("/api/tip-seminara", requireApiAuth, hasPermission, tipSeminaraRoutes);
app.use("/api/test", testRoutes);

Sentry.setupExpressErrorHandler(app);

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

import { clerkMiddleware } from "@clerk/express";
import * as Sentry from "@sentry/node";
import cors from "cors";
import express from "express";
import { connectDB } from "./database/db";
import { errorWrapper } from "./middleware/errorWrapper";
import { requireApiAuth } from "./middleware/requireApiAuth";
import delatnostiRoutes from "./routes/delatnost.routes";
import docxRoutes from "./routes/docx.routes";
import firmaRoutes from "./routes/firma.routes";
import mestoRoutes from "./routes/mesto.routes";
import pretrageRoutes from "./routes/pretrage.routes";
import racuniRoutes from "./routes/racuni.routes";
import racuniV2Routes from "./routes/racuni_v2.routes";
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
    exposedHeaders: ["Authorization", "Content-Disposition"],
  }),
);

app.use(
  clerkMiddleware({
    publishableKey: env.clerk.publishableKey,
    secretKey: env.clerk.secretKey,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.use("/api/firma", requireApiAuth, firmaRoutes);
app.use("/api/velicine-firmi", requireApiAuth, velicineFirmiRoutes);
app.use("/api/radna-mesta", requireApiAuth, radnaMestaRoutes);
app.use("/api/tip-firme", requireApiAuth, tipFirmeRoutes);
app.use("/api/delatnost", requireApiAuth, delatnostiRoutes);
app.use("/api/mesto", requireApiAuth, mestoRoutes);
app.use("/api/pretrage", requireApiAuth, pretrageRoutes);
app.use("/api/stanja-firmi", requireApiAuth, stanjaFirmeRoutes);
app.use("/api/seminari", requireApiAuth, seminarRoutes);
app.use("/api/docx", requireApiAuth, docxRoutes);
app.use("/api/racuni", requireApiAuth, racuniRoutes);
app.use("/api/racuni-v2", requireApiAuth, racuniV2Routes);
app.use("/api/audit-log", requireApiAuth, auditLogRoutes);
app.use("/api/email-suppression", requireApiAuth, emailSuppressionRoutes);
app.use("/api/tip-seminara", requireApiAuth, tipSeminaraRoutes);
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

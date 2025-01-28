import { env } from "./utils/envVariables";
import { connectDB } from "./database/db";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
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
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";

const app = express();

app.use(
	cors({
		origin: true,
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

const customRequireAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const auth = getAuth(req);
	console.log("auth", auth.userId);

	if (auth.userId) {
		console.log(
			"user stuf",
			(await clerkClient.users.getUser(auth.userId)).primaryEmailAddress
				?.emailAddress,
		);
	} else {
		console.log("no user stuff");
	}
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

import { oak } from './deps.ts';
import { authRoutes } from './src/routes/auth-routes.ts';

const app = new oak.Application();
const router = new oak.Router();

authRoutes(router);

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });

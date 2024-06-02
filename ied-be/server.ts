import { oak, oakCors } from './deps.ts';
import { ENV } from './envVariables.ts';
import { authRoutes } from './src/routes/auth-routes.ts';

const app = new oak.Application();
const router = new oak.Router();

authRoutes(router);

app.use(
  oakCors({
    origin: `${ENV.feAppUri}:${ENV.beAppPort}`,
  })
);
app.use(router.routes());
app.use(router.allowedMethods());

try {
  await app.listen({ port: Number(ENV.beAppPort) });
} catch (error) {
  console.error('Error starting server:', error);
}

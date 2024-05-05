import { oak, oakCors, config } from './deps.ts';
import { authRoutes } from './src/routes/auth-routes.ts';

const env = config();

const app = new oak.Application();
const router = new oak.Router();

authRoutes(router);

app.use(
  oakCors({
    origin: 'http://localhost:5173',
  })
);
app.use(router.routes());
app.use(router.allowedMethods());

try {
  await app.listen({ port: Number(env.PORT) });
} catch (error) {
  console.error('Error starting server:', error);
}

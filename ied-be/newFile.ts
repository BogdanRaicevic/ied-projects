import { app, env } from './server.ts';

app
  .listen({ port: env.PORT })
  .then(() => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  })
  .catch((error) => {
    console.error('Error starting server:', error);
  });

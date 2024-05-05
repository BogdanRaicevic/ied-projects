import { compare, config, jwt, oak } from '../../deps.ts';
import { validateJwt } from '../middleware/auth-middleware.ts';
import { encodePassword } from '../services/auth-service.ts';
import { findUserByName } from '../services/ied-user-service.ts';

const env = config();

const header: jwt.Header = { alg: 'HS256', typ: 'JWT' };

export const authRoutes = (router: oak.Router) => {
  router.post('/login', async (ctx) => {
    console.log('ovde sam nekim cudom');

    const body = await ctx.request.body.json();
    const user = await findUserByName(body.username);

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = 'Not Found';
      return;
    }

    if (
      body.username === user.name &&
      //TODO: the compare is temporary untill i make hashing work from FE
      (await compare(body.password, user.password))
    ) {
      const payload: jwt.Payload = {
        iss: user.name,
        exp: jwt.getNumericDate(60 * 60), // Token will expire in 1 hour,
      };

      const encryptedKey = await encodePassword(env.AUTH_KEY);
      if (typeof env.AUTH_KEY !== 'string') {
        throw new Error('AUTH_KEY must be a string');
      }
      const token = await jwt.create(header, payload, encryptedKey);
      ctx.cookies.set('token', token); // Set the token as a session cookie

      ctx.response.status = 200;
      ctx.response.body = { token };
    } else {
      ctx.response.status = 401;
      ctx.response.body = 'Unauthorized';
    }
  });

  router.get('/logout', (ctx) => {
    ctx.cookies.delete('token');
    ctx.response.body = 'logout route';
  });

  router.post('/test', validateJwt, async (ctx) => {
    ctx.response.status = 200;
  });
};

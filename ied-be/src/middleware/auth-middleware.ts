import { jwt } from '../../deps.ts';
import { ENV } from '../../envVariables.ts';
import { TODO_ANY } from '../../utils.ts';
import { encodePassword } from '../services/auth-service.ts';

// JWT validation middleware
export const validateJwt = async (ctx: TODO_ANY, next: TODO_ANY) => {
  const authHeader = ctx.request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.response.status = 401;
    ctx.response.body = 'Unauthorized';
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = 'Unauthorized';
    return;
  }

  try {
    const encryptedKey = await encodePassword(ENV.authKey);
    const payload = (await jwt.verify(token, encryptedKey)) as jwt.Payload;

    if (!payload || !payload.iss) {
      ctx.response.status = 401;
      ctx.response.body = 'Unauthorized';
      return;
    }

    ctx.state.user = payload.iss;

    await next();
  } catch (err) {
    ctx.response.status = 401;
    ctx.response.body = 'Unauthorized';
  }
};

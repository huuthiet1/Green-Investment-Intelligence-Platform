import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';

const client = new OAuth2Client(env.googleClientId);

export async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.googleClientId
  });
  return ticket.getPayload();
}

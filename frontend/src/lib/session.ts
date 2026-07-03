// Stateless HMAC-signed session tokens for Edge compatibility.
// Token format: exp.email.hmacSig (base64url encoded)
// Secret: SESSION_SECRET || SUPABASE_SERVICE_ROLE_KEY (fallback)

import { createHmac } from 'crypto';

const getSecret = (): string => {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY must be set');
  return secret;
};

export interface SessionPayload {
  email: string;
  exp: number;
  role?: 'admin' | 'farm';
}

export function signSession(payload: SessionPayload): string {
  const secret = getSecret();
  const exp = payload.exp || Math.floor(Date.now() / 1000) + 86400 * 7; // 7 days
  const msg = `${exp}.${payload.email}`;
  const hmac = createHmac('sha256', secret)
    .update(msg)
    .digest('base64url');
  return `${msg}.${hmac}`;
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const secret = getSecret();
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [exp, email, sig] = parts;
    const msg = `${exp}.${email}`;
    const hmac = createHmac('sha256', secret)
      .update(msg)
      .digest('base64url');

    if (sig !== hmac) return null;

    const expTime = parseInt(exp, 10);
    if (expTime < Math.floor(Date.now() / 1000)) return null; // Expired

    return { email, exp: expTime };
  } catch (err) {
    return null;
  }
}

export function getSessionCookie(token: string): string {
  return `belarro_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${86400 * 7}`;
}

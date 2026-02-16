const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sign(payload, secret, expiresInSeconds = 7 * 24 * 60 * 60) {
  if (!secret) {
    throw new Error('AUTH_SECRET is not set');
  }
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = base64url(JSON.stringify({ ...payload, exp }));
  const sig = base64url(
    crypto.createHmac('sha256', secret).update(body).digest()
  );
  return `${body}.${sig}`;
}

function verify(token, secret) {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = base64url(
    crypto.createHmac('sha256', secret).update(body).digest()
  );
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function getTokenFromReq(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

module.exports = { sign, verify, getTokenFromReq };

/**
 * Protections de sécurité légères, sans dépendance externe.
 *
 * IMPORTANT :
 * Ce rate limiter est volontairement simple pour ne pas modifier
 * l'architecture actuelle du frontend/backend.
 *
 * Pour plusieurs instances Render, un rate limiter Redis sera préférable
 * plus tard.
 */

const buckets = new Map();

function getClientIp(req) {
  return (
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function rateLimit({
  windowMs = 15 * 60 * 1000,
  max = 100,
  keyGenerator = getClientIp,
  message = 'Trop de requêtes. Veuillez réessayer plus tard.',
} = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = String(keyGenerator(req));

    let entry = buckets.get(key);

    if (!entry || now - entry.start >= windowMs) {
      entry = {
        start: now,
        count: 0,
      };

      buckets.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil(
        (windowMs - (now - entry.start)) / 1000
      );

      res.set('Retry-After', String(retryAfter));

      return res.status(429).json({
        success: false,
        message,
      });
    }

    next();
  };
}

/*
 * Nettoyage périodique pour éviter que la Map grossisse indéfiniment.
 */
setInterval(() => {
  const now = Date.now();

  for (const [key, entry] of buckets.entries()) {
    if (now - entry.start > 30 * 60 * 1000) {
      buckets.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS uniquement lorsque l'application est utilisée en HTTPS.
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  next();
}

module.exports = {
  rateLimit,
  securityHeaders,
};

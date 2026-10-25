// Limitador por IP en memoria (ventana fija). En serverless cada instancia tiene
// su propio contador, así que es una barrera de mejor esfuerzo contra abuso,
// no un límite estricto.

export function createRateLimiter({ max = 5, windowMs = 10 * 60 * 1000, now = Date.now } = {}) {
  const hits = new Map();
  return function allow(key) {
    const t = now();
    for (const [k, v] of hits) if (v.reset <= t) hits.delete(k);
    const entry = hits.get(key);
    if (!entry) {
      hits.set(key, { count: 1, reset: t + windowMs });
      return true;
    }
    if (entry.count >= max) return false;
    entry.count += 1;
    return true;
  };
}

export function clientIp(req) {
  const fwd = req.headers?.["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "desconocida";
}

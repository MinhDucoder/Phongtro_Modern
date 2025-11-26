const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 10,
  keyGenerator = (req) => req.ip,
  message = "Bạn thao tác quá nhanh, vui lòng thử lại sau",
} = {}) => {
  const hits = new Map();

  const cleanup = () => {
    const now = Date.now();
    for (const [key, timestamps] of hits.entries()) {
      const filtered = timestamps.filter((timestamp) => now - timestamp < windowMs);
      if (filtered.length > 0) {
        hits.set(key, filtered);
      } else {
        hits.delete(key);
      }
    }
  };

  const timer = setInterval(cleanup, windowMs);
  if (typeof timer.unref === "function") {
    timer.unref();
  }

  return (req, res, next) => {
    const key = keyGenerator(req) || req.ip || "anonymous";
    const now = Date.now();
    const timestamps = hits.get(key) || [];
    const filtered = timestamps.filter((timestamp) => now - timestamp < windowMs);

    if (filtered.length >= max) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    filtered.push(now);
    hits.set(key, filtered);
    next();
  };
};

export default createRateLimiter;








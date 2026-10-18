/**
 * @file apps/api/middleware/requestLogger.js
 * @description Lightweight structured request logger
 */

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 300 ? '\x1b[36m' : '\x1b[32m';
    const reset = '\x1b[0m';
    
    // Skip noisy health checks in normal logs if desired
    if (originalUrl !== '/health') {
      console.log(`[HTTP] ${method} ${originalUrl} ${color}${status}${reset} - ${duration}ms (${ip || 'unknown'})`);
    }
  });

  next();
};

export default requestLogger;

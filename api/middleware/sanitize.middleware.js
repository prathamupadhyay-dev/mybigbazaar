/**
 * @file apps/api/middleware/sanitize.middleware.js
 * @description NoSQL injection defense sanitizer stripping MongoDB query operators from user inputs
 */

import mongoSanitize from 'mongo-sanitize';

export const sanitizeNoSql = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeNoSql(obj[key]);
    }
  }
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    mongoSanitize(req.body);
    sanitizeNoSql(req.body);
  }
  if (req.query) {
    mongoSanitize(req.query);
    sanitizeNoSql(req.query);
  }
  if (req.params) {
    mongoSanitize(req.params);
    sanitizeNoSql(req.params);
  }
  next();
};

export default sanitizeInput;

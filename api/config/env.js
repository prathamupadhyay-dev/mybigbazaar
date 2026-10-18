/**
 * @file apps/api/config/env.js
 * @description Centralized, validated environment configuration
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from apps/api root or monorepo root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function resolveMongoUri() {
  if (process.env.TEST_MONGO_URI) return process.env.TEST_MONGO_URI;
  const base = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bigbazaar';
  if (process.env.NODE_ENV === 'test') {
    return base.replace(/\/([^/?]+)(\?|$)/, '/$1_qa_test$2');
  }
  return base;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: resolveMongoUri(),
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_mybigbazaar_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Email / SMTP
  EMAIL: process.env.EMAIL || '',
  PASSWORD: process.env.PASSWORD || '',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_FROM: process.env.EMAIL_FROM || 'MyBigBazaar <noreply@mybigbazaar.com>',

  // Storage
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../public/uploads'),
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || `https://backend.mybigbazaar.com`,

  // Providers
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'mock',
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'mock',

  // Client CORS origins
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8081',
    'http://localhost:19006',
    'http://10.0.2.2:3000',
    'http://10.0.2.2:5000',
    'https://backend.mybigbazaar.com',
    'https://mybigbazaar.com',
    'https://admin.mybigbazaar.com'
  ]
};

export default env;

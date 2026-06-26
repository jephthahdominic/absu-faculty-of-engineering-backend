import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requiredEnvVars = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api',

  MONGODB_URI: process.env.MONGODB_URI as string,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  PASSWORD_RESET_SECRET: process.env.PASSWORD_RESET_SECRET || 'reset-secret-change-me',
  PASSWORD_RESET_EXPIRES_IN: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'ABSU Faculty System <noreply@absu.edu.ng>',

  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || '',
  R2_PUBLIC_URL: (process.env.R2_PUBLIC_URL || '').replace(/\/$/, ''),

  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@absu.edu.ng',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456',
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME || 'Super Administrator',

  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};

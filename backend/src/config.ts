// src/config.ts
import 'dotenv/config';

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export default {
  env,
  isProd,
  port: Number(process.env.PORT || 4000),

  mongoUrl: required('MONGODB_URL'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessTtl: process.env.ACCESS_TTL || '30m',
    refreshTtl: process.env.REFRESH_TTL || '15d',
  },

  cors: {
    // ako želiš centralno podešavati preko .env (opcionalno)
    origins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://bingoposta.edinmesan.ba')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
  },
};

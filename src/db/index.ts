/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

// Function to create a new connection pool using the Object Method.
export const createPool = () => {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return new Pool({
      connectionString,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 10000, // Terminate idle pool connections after 10s so Neon compute can scale-to-zero
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      ssl: connectionString.includes('neon.tech') || connectionString.includes('sslmode=require') || connectionString.includes('railway') || connectionString.includes('rlwy.net') || process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  // Fall back to individual SQL credentials only if DATABASE_URL is absent
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    ssl: process.env.SQL_HOST?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
};

// Create a pool instance.
export const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });


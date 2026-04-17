#!/usr/bin/env node
/**
 * migrate.mjs – Run pending Supabase migrations on startup.
 *
 * Requirements (add to .env):
 *   DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
 *
 * How it works:
 *   1. Connects to Postgres using DATABASE_URL.
 *   2. Creates a `schema_migrations` tracking table if it doesn't exist.
 *   3. Reads all *.sql files from supabase/migrations/ in chronological order.
 *   4. Skips migrations already recorded in `schema_migrations`.
 *   5. Runs each pending migration inside a transaction and records it on success.
 */

import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// ── Load .env manually (no external dep needed) ────────────────────────────
async function loadDotEnv() {
  try {
    const envPath = join(projectRoot, '.env');
    const raw = await readFile(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional in CI/production where vars are already injected
  }
}

// ── Resolve pg dynamically so the script works even if pg is a devDep ──────
async function getPgClient(connectionString) {
  let pg;
  try {
    // Try ESM-style import first (pg v8+ with "exports" field)
    const require = createRequire(import.meta.url);
    pg = require('pg');
  } catch {
    throw new Error(
      'The "pg" package is not installed.\n' +
      'Run: npm install --save-dev pg\n' +
      'Then add DATABASE_URL to your .env file.'
    );
  }

  const { Client } = pg;
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

// ── Migration table bootstrap ───────────────────────────────────────────────
async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      id         SERIAL PRIMARY KEY,
      filename   TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// ── Fetch already-applied migration filenames ───────────────────────────────
async function getAppliedMigrations(client) {
  const { rows } = await client.query(
    'SELECT filename FROM public.schema_migrations ORDER BY filename'
  );
  return new Set(rows.map(r => r.filename));
}

// ── Read migration files sorted chronologically ─────────────────────────────
async function getMigrationFiles() {
  const migrationsDir = join(projectRoot, 'supabase', 'migrations');
  const files = await readdir(migrationsDir);
  return files
    .filter(f => f.endsWith('.sql'))
    .sort() // timestamp prefix guarantees chronological order
    .map(f => ({ filename: f, fullPath: join(migrationsDir, f) }));
}

// ── Run a single migration inside a transaction ─────────────────────────────
async function runMigration(client, filename, fullPath) {
  const sql = await readFile(fullPath, 'utf8');
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      'INSERT INTO public.schema_migrations (filename) VALUES ($1)',
      [filename]
    );
    await client.query('COMMIT');
    console.log(`  ✓  ${filename}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw new Error(`Migration failed [${filename}]: ${err.message}`);
  }
}

// ── Resolve a DB connection URL from available env vars ─────────────────────
// Priority:
//   1. DATABASE_URL                          (explicit, most reliable)
//   2. VITE_SUPABASE_URL + SUPABASE_DB_PASSWORD  (derive from existing env)
//   3. undefined → skip migrations with a warning (don't fail the build)
function resolveDbUrl() {
  if (process.env.DATABASE_URL) {
    return { url: process.env.DATABASE_URL, source: 'DATABASE_URL' };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const dbPassword  = process.env.SUPABASE_DB_PASSWORD;

  if (supabaseUrl && dbPassword) {
    // Extract project ref from https://<ref>.supabase.co
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      const ref = match[1];
      const url = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres`;
      return { url, source: 'VITE_SUPABASE_URL + SUPABASE_DB_PASSWORD' };
    }
  }

  return { url: null, source: null };
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  await loadDotEnv();

  const { url: dbUrl, source } = resolveDbUrl();

  if (!dbUrl) {
    console.warn(
      '\n⚠️   No database credentials found — skipping migrations.\n' +
      '    To enable migrations, set one of the following:\n\n' +
      '    Option 1 (recommended):\n' +
      '      DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres\n\n' +
      '    Option 2 (if VITE_SUPABASE_URL is already set):\n' +
      '      SUPABASE_DB_PASSWORD=<your-db-password>\n\n' +
      '    Find your credentials at:\n' +
      '    Supabase Dashboard → Project Settings → Database → Connection string\n'
    );
    // Exit 0 so the build continues even without migrations
    return;
  }

  console.log(`\n🔄  Running database migrations… (credentials from: ${source})\n`);

  let client;
  try {
    client = await getPgClient(dbUrl);

    await ensureMigrationsTable(client);

    const applied = await getAppliedMigrations(client);
    const allMigrations = await getMigrationFiles();
    const pending = allMigrations.filter(m => !applied.has(m.filename));

    if (pending.length === 0) {
      console.log('✅  Database is up to date. No pending migrations.\n');
      return;
    }

    console.log(`📦  Found ${pending.length} pending migration(s):\n`);
    for (const migration of pending) {
      await runMigration(client, migration.filename, migration.fullPath);
    }

    console.log(`\n✅  ${pending.length} migration(s) applied successfully.\n`);
  } finally {
    if (client) await client.end();
  }
}

main().catch(err => {
  console.error('\n❌  Migration error:', err.message);
  process.exit(1);
});

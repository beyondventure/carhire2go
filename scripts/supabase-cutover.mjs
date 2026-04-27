#!/usr/bin/env node
/**
 * Guided Lovable Cloud -> owned Supabase cutover helper.
 *
 * Default mode is read-only: it validates local inputs and prints the deployment plan.
 * Mutating flags require CONFIRM_SUPABASE_CUTOVER to match TARGET_SUPABASE_PROJECT_REF.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { spawnSync } from 'child_process';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));
const shouldLink = args.has('--link');
const shouldPushDb = args.has('--push-db');
const shouldDeployFunctions = args.has('--deploy-functions');
const shouldSetSecrets = args.has('--set-secrets');
const useApi = args.has('--use-api');
const help = args.has('--help') || args.has('-h');

const envFile = join(projectRoot, '.env.supabase-migration');

function printHelp() {
  console.log(`
Usage:
  npm run supabase:cutover:plan
  npm run supabase:cutover -- --link
  npm run supabase:cutover -- --link --push-db --deploy-functions --set-secrets --use-api

Environment:
  Copy .env.supabase-migration.example to .env.supabase-migration and fill the target project values.
  Copy .env.supabase-secrets.example to .env.supabase-secrets before using --set-secrets.

Safety:
  Mutating flags require CONFIRM_SUPABASE_CUTOVER to equal TARGET_SUPABASE_PROJECT_REF.
`);
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  const raw = readFileSync(path, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function fail(message) {
  console.error(`\nERROR: ${message}\n`);
  process.exit(1);
}

function run(command, commandArgs) {
  console.log(`\n$ ${[command, ...commandArgs].join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) fail(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function listFiles(dir) {
  const fullDir = join(projectRoot, dir);
  if (!existsSync(fullDir)) return [];
  return readdirSync(fullDir).filter((file) => !file.startsWith('.')).sort();
}

function readConfigProjectId() {
  const configPath = join(projectRoot, 'supabase', 'config.toml');
  if (!existsSync(configPath)) return null;

  const match = readFileSync(configPath, 'utf8').match(/^project_id\s*=\s*"([^"]+)"/m);
  return match?.[1] ?? null;
}

function readLinkedProjectRef() {
  const linkedProjectRefPath = join(projectRoot, 'supabase', '.temp', 'project-ref');
  if (!existsSync(linkedProjectRefPath)) return null;

  return readFileSync(linkedProjectRefPath, 'utf8').trim() || null;
}

if (help) {
  printHelp();
  process.exit(0);
}

loadEnvFile(envFile);

const projectRef = process.env.TARGET_SUPABASE_PROJECT_REF;
const projectUrl = process.env.TARGET_SUPABASE_URL;
const publishableKey = process.env.TARGET_SUPABASE_PUBLISHABLE_KEY;
const secretsFile = process.env.SUPABASE_SECRETS_ENV_FILE || '.env.supabase-secrets';
const secretsPath = join(projectRoot, secretsFile);
const wantsMutation = shouldLink || shouldPushDb || shouldDeployFunctions || shouldSetSecrets;

if (!projectRef || projectRef.includes('your_new_project_ref')) {
  fail('Set TARGET_SUPABASE_PROJECT_REF in .env.supabase-migration first.');
}

if (!projectUrl || projectUrl.includes('your_new_project_ref')) {
  fail('Set TARGET_SUPABASE_URL in .env.supabase-migration first.');
}

if (!publishableKey || publishableKey.includes('your_key_here')) {
  console.warn('WARN: TARGET_SUPABASE_PUBLISHABLE_KEY is missing or still a placeholder.');
}

if (!projectUrl.includes(projectRef)) {
  console.warn('WARN: TARGET_SUPABASE_URL does not appear to contain TARGET_SUPABASE_PROJECT_REF.');
}

if (wantsMutation && process.env.CONFIRM_SUPABASE_CUTOVER !== projectRef) {
  fail('Set CONFIRM_SUPABASE_CUTOVER to TARGET_SUPABASE_PROJECT_REF before running mutating flags.');
}

const configProjectId = readConfigProjectId();
const linkedProjectRef = readLinkedProjectRef();
const migrations = listFiles('supabase/migrations').filter((file) => file.endsWith('.sql'));
const functions = listFiles('supabase/functions');

console.log('\nInstantRyde Supabase cutover plan');
console.log('--------------------------------');
console.log(`Target project ref: ${projectRef}`);
console.log(`Target project URL: ${projectUrl}`);
console.log(`Local config project_id: ${configProjectId ?? 'not found'}`);
console.log(`Linked project ref: ${linkedProjectRef ?? 'not linked'}`);
console.log(`Migrations discovered: ${migrations.length}`);
console.log(`Edge Functions discovered: ${functions.length}`);

if (linkedProjectRef && linkedProjectRef !== projectRef) {
  console.log(
    '\nNOTE: this checkout is linked to a different remote project. ' +
      'Run --link with the intended target before pushing migrations.'
  );
} else if (!linkedProjectRef) {
  console.log(
    '\nNOTE: no linked remote project was found in supabase/.temp/project-ref. ' +
      'Run --link when ready.'
  );
}

console.log('\nRequired app env updates after backend deployment:');
console.log(`  Web:    VITE_SUPABASE_URL=${projectUrl}`);
console.log('  Web:    VITE_SUPABASE_PUBLISHABLE_KEY=<target publishable key>');
console.log(`  Native: EXPO_PUBLIC_SUPABASE_URL=${projectUrl}`);
console.log('  Native: EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<target publishable key>');

console.log('\nRecommended command sequence:');
console.log('  supabase login');
console.log(`  supabase link --project-ref ${projectRef}`);
console.log('  supabase db push --dry-run');
console.log('  supabase db push');
console.log(`  supabase functions deploy --project-ref ${projectRef}${useApi ? ' --use-api' : ''}`);
console.log(`  supabase secrets set --env-file ${secretsFile} --project-ref ${projectRef}`);

if (!wantsMutation) {
  console.log('\nPlan only. Add --link, --push-db, --deploy-functions, or --set-secrets to execute steps.');
  process.exit(0);
}

if (shouldLink) {
  run('supabase', ['link', '--project-ref', projectRef]);
}

if (shouldPushDb) {
  run('supabase', ['db', 'push', '--dry-run']);
  run('supabase', ['db', 'push']);
}

if (shouldDeployFunctions) {
  const deployArgs = ['functions', 'deploy', '--project-ref', projectRef];
  if (useApi) deployArgs.push('--use-api');
  run('supabase', deployArgs);
}

if (shouldSetSecrets) {
  if (!existsSync(secretsPath)) {
    fail(`Secrets file not found: ${secretsPath}`);
  }
  run('supabase', ['secrets', 'set', '--env-file', secretsFile, '--project-ref', projectRef]);
}

console.log('\nCutover command(s) finished. Run the smoke tests in docs/LOVABLE_TO_SUPABASE_MIGRATION.md.');

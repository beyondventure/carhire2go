# Lovable Cloud To Supabase Migration

This repo can rebuild the InstantRyde backend into a Supabase project that we control. Use this when the current backend is Lovable Cloud-managed and does not appear in our Supabase dashboard.

## What We Can Migrate From The Repo

- Database schema and RLS from `supabase/migrations`.
- Edge Functions from `supabase/functions`.
- Web and native clients by changing their Supabase URL and publishable key.

Existing Lovable Cloud production data is a separate export problem. Without a Lovable-provided SQL/Auth/Storage export or direct database URL, we should assume existing users must re-register or reset passwords on the new project.

## 1. Create The Owned Supabase Project

Create a new Supabase project under the InstantRyde-controlled Supabase organization, then collect:

- Project ref.
- Project URL.
- Publishable/anon key.
- Service role key.
- Database password and connection string.

Choose the region deliberately for the main user base. After creation, configure Auth email settings and any production redirect URLs before inviting real users.

## 2. Prepare Local Cutover Files

From this directory:

```bash
cd /Users/abdul/EVERYTHING-TECH/WORK/instant-ryde/carhire2go
cp .env.supabase-migration.example .env.supabase-migration
cp .env.supabase-secrets.example .env.supabase-secrets
```

Fill `.env.supabase-migration` with the new project ref, URL, and publishable key. Fill `.env.supabase-secrets` with only Edge Function secrets.

Never commit either copied file.

## 3. Review The Deployment Plan

```bash
npm run supabase:cutover:plan
```

This validates the target values, counts migrations/functions, and prints the exact command sequence without touching Supabase.

## 4. Link, Push Migrations, Deploy Functions, And Upload Secrets

Authenticate first:

```bash
supabase login
```

Then set the safety confirmation in `.env.supabase-migration`:

```text
CONFIRM_SUPABASE_CUTOVER=<new-project-ref>
```

Run the cutover in stages:

```bash
npm run supabase:cutover -- --link
npm run supabase:cutover -- --push-db
npm run supabase:cutover -- --deploy-functions --use-api
npm run supabase:cutover -- --set-secrets
```

Use `--use-api` if Docker is unavailable locally. Omit it if Docker is running and you prefer local bundling.

After `--link`, verify the CLI link state:

```bash
cat supabase/.temp/project-ref
cat supabase/.temp/linked-project.json
```

These files should point to the new project ref. Depending on the Supabase CLI version, `supabase/config.toml` may keep its existing `project_id` and should not be treated as the source of truth for the linked remote project.

## 5. Update App Environments

Update web:

```text
VITE_SUPABASE_URL=https://<new-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<new publishable key>
```

Update native local and EAS environments:

```text
EXPO_PUBLIC_SUPABASE_URL=https://<new-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<new publishable key>
```

If native build-time config changes, rebuild the dev client before smoke testing.

## 6. Request Lovable Cloud Export Separately

Send Lovable support a request for:

- PostgreSQL schema and data dump.
- Supabase Auth users, including password hashes if supported.
- Storage bucket metadata and object export.
- Edge Function source or configuration that exists only in Lovable.
- Environment variable names and integration inventory.

If they provide a database URL or SQL files, restore into a staging Supabase project first. Do not restore unknown SQL directly over the main cutover project.

## 7. Smoke Test Before Cutover

- Sign up and sign in from native.
- Confirm `profiles` and `user_roles` are created.
- Create a consumer booking.
- Confirm `estimate-booking-price` responds and the native app uses the Edge Function estimate.
- Confirm recent/saved locations read and write through `public.user_locations`.
- Confirm provider request intake, decline, and matching flows still work.
- Verify Flutterwave payment verification and webhook behavior in sandbox.
- Verify push token storage and push notification functions if enabled.
- Confirm RLS blocks cross-user reads.

Only after these pass should the new Supabase values be promoted into production app environments.

## 8. Post-Cutover Cleanup

After the smoke tests pass:

- Delete any publicly deployed bootstrap-only functions, especially `create-test-users` and `seed-demo-data`.
- Keep `.env.supabase-migration`, `.env.supabase-secrets`, and `supabase/.temp/` uncommitted.
- Keep native recent/saved locations and booking estimates backend-only; the temporary AsyncStorage and local pricing fallbacks should stay removed.
- Review production EAS/web environments and remove any remaining Lovable Cloud URL values.
- Keep `supabase/config.toml` and `supabase/.temp/project-ref` aligned with the owned Supabase project ref.

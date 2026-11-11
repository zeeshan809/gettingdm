# GettingDM

UI for the Instagram comment-to-DM automation and creator storefront platform. **Frontend only** — all data comes from `src/lib/mock-data.ts`; no backend, auth or API calls yet.

```bash
npm install
npm run dev   # http://localhost:3000
```

## Where things are

| Area | Routes |
|---|---|
| Marketing | `/` |
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/onboarding` |
| Creator portal | `/dashboard`, `/campaigns`, `/campaigns/new`, `/campaigns/[id]`, `/storefront`, `/analytics`, `/instagram`, `/billing`, `/notifications`, `/support`, `/settings` |
| Public storefront | `/[username]` and `/[username]?campaign=<id>` (try `/zeeshan?campaign=cmp_python`) |
| Admin portal | `/admin/login`, `/admin`, `/admin/analytics`, `/admin/creators`, `/admin/campaigns`, `/admin/instagram`, `/admin/infrastructure`, `/admin/support`, `/admin/subscriptions`, `/admin/payments`, `/admin/roles`, `/admin/audit-logs` |

## Backend (Supabase)

Secrets live in `.env.local` (gitignored). Database migrations are in `supabase/migrations/`.

```bash
supabase db push --linked                                          # apply new migrations
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
node --env-file=.env.local scripts/create-admin.mjs <email> <password> "<name>"
```

- **Auth is live:** register, login, email verification, forgot/reset password, logout and onboarding featured links.
- **Route protection:**
  - `src/middleware.ts` protects routes.
  - `getCurrentCreator()` / `getCurrentAdmin()` in `src/lib/auth.ts` check access server-side.
- **Email confirmation is off** (Supabase Auth setting), so new creators are signed in right after registering and their trial starts immediately.
- **Admin sign-in:** email and password, and the account must be in `admin_users`. Two-factor authentication was removed on request; consider re-adding it before launch.
- **Trial and campaign limits:**
  - The 30-day trial starts when the email is verified.
  - Active campaigns are capped at 5 (Creator) or 50 (Creator Plus).
  - Both are enforced in the database.
- **Server-only tables:** `instagram_tokens` and `webhook_events`. `audit_logs` is append-only.
- **Storefront is live:**
  - The editor (`/storefront`) saves profile, socials, theme, the 3 featured links and the default fourth link in one atomic call (`save_storefront`).
  - The public page `/[username]` reads real data. `?campaign=` is honoured only for a live campaign owned by that creator; otherwise the default link shows.
  - Link clicks go through `/go/[username]/[slot]`, which looks the destination up from the database and records the click.
  - Visits are counted with a daily salted visitor hash (`ANALYTICS_SALT`); no IPs are stored.
- **Campaigns are live:**
  - You can create, edit, pause/resume and delete campaigns. Per-campaign stats come from `campaign_stats()`, and the automation log comes from `comment_events`.
  - Post details are looked up on the server (`src/lib/instagram.ts`), never trusted from the browser.
  - Until Meta is connected, development shows sample posts. Production shows none.
  - The database enforces two rules: one active campaign per post per creator, and the plan's active-campaign limit.
- **Dashboard and analytics are live:**
  - The date range comes from the URL (`?range=today|7d|30d|month|prev_month|custom&from&to`) and is resolved to IST calendar days in `src/lib/date-range.ts`.
  - Data comes from the database functions `creator_daily`, `campaign_stats(range)`, `keyword_stats` and `link_stats`.
  - Change vs the previous period compares against an equally long period just before the selected one.
  - Purchases show "—" until a checkout integration exists.
- **Settings, notifications and support are live:**
  - Settings covers name, login email, password change (re-checks the current password), email preferences, and account deletion (deletes the auth user; all data cascades).
  - Notifications are created only server-side through `notify()`: a welcome message on sign-up, and an alert when support replies.
  - Support tickets are created with `create_support_ticket()`. A trigger sets the ticket to "waiting" on a support reply and back to "open" on a creator reply.
- **Image uploads:** disabled until R2 is connected.
- **Still mock data:** the Instagram and billing pages, and the admin portal.

## Wiring the backend later

- Replace exports in `src/lib/mock-data.ts` with API calls; pages only import from there.
- `getStorefront()` already follows PRD §7.4: only the campaign id is read from the URL, it's validated against the creator, and the link URL always comes from stored data.
- `src/lib/keywords.ts` (`matchKeyword`) is pure and can be reused by the webhook worker.
- Product name/domain/plans live in `src/lib/config.ts`.
- Forms currently show a toast instead of saving; image upload validates type/size client-side only.

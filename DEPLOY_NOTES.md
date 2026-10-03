# Deploying this alongside the updated backend

This frontend now matches `Movie-explorer-Backend-main` (updated in the same
pass). Every action in the UI hits a real endpoint:

| Feature | Endpoint |
|---|---|
| Login, list users, extend, end | unchanged, same as before |
| Create user | `POST /api/admin/users` |
| Reactivate subscription | `POST /api/admin/users/:id/reactivate` |
| Reset password | `POST /api/admin/users/:id/reset-password` (returns a one-time temporary password, shown once in the UI) |
| Disable / enable account | `POST /api/admin/users/:id/disable` / `.../enable` |
| Delete account | `DELETE /api/admin/users/:id` |
| Sales dashboard (revenue, success rate, daily chart) | `GET /api/admin/payments/summary?days=7\|30\|90` |
| Payments page (list, filter, search) | `GET /api/admin/payments?status=&search=&page=` |

## One thing to do before deploying

The backend's `schema.sql` now adds two columns to `users` (`name`,
`is_disabled`) using `ADD COLUMN IF NOT EXISTS`, so it's safe to run against
your existing database — including the one your Flutter app is already
using. Run this once against your production database before pointing this
frontend at it:

```
npm run setup-db
```

(or apply the two `ALTER TABLE` lines in `src/db/schema.sql` manually if you
don't want to re-run the whole setup script).

Without that, `GET /api/admin/users` and the new endpoints will fail with a
"column does not exist" error, since they now select `users.name` and
`users.is_disabled`.

## M-Pesa payments

The dashboard shows real M-Pesa sales. It needs the M-Pesa version of the
backend (`Movie-explorer-Backend-mpesa`), which has the `orders` table and the
two admin endpoints above. Deploy the backend first, run `npm run setup-db`,
then deploy this panel.

- **Revenue only counts COMPLETED payments** (confirmed by Safaricom). Users you
  add, extend or reactivate by hand have no payment, so they are not revenue.
- "Today", "this month" and the daily chart use Nairobi time.
- A payment still PENDING after 10 minutes is shown as **No response**
  (the customer never answered the prompt).

## Still intentionally not implemented

Activity and Notifications pages stay as honest empty states - there is no
activity log or notification system in the backend yet.

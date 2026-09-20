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

## Still intentionally not implemented

Payments, Activity and Notifications pages stay as honest empty states —
there's no payments table or notification system in the backend yet, so
nothing is invented there.

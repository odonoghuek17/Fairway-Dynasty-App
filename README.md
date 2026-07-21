# Fairway Dynasty — Phase 1

This version adds:

- Real Supabase email/password signup
- Login
- Protected dashboard
- Sign out
- Responsive Fairway Dynasty styling

## Vercel environment variables

Add these in Vercel → Project Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Apply both variables to Production, Preview, and Development, then redeploy.

## Supabase URL configuration

In Supabase → Authentication → URL Configuration:

- Set **Site URL** to `https://fairway-dynasty.com`
- Add redirect URLs:
  - `https://fairway-dynasty.com/**`
  - `https://www.fairway-dynasty.com/**`
  - Your Vercel preview URL followed by `/**`

## Uploading to GitHub

Delete the old plain-site files (`index.html`, `style.css`, and `script.js`) and upload every file and folder from this project to the repository root.

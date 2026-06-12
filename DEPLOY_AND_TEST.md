# 🚀 Share the App with Friends (Android) — Checklist

Everything in the codebase is already prepared. These remaining steps need **your own accounts** (Expo + Render), so you run them once.

---

## Part A — Deploy the backend (Render, free)

The backend is already production-ready (`render.yaml`, `npm run start`, Prisma auto-generate are all set).

1. Push this repo to **GitHub** (if not already).
2. Go to **render.com** → sign up (free) → **New + → Blueprint**.
3. Connect your GitHub repo. Render reads `render.yaml` automatically.
4. It will prompt for each secret — paste your real values:
   - `DATABASE_URL` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any long random string
   - `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` / `DEEPSEEK_API_KEY` — **valid** keys (current ones are placeholders → AI stays offline without these)
   - `RESEND_API_KEY` — for password-reset emails (optional)
5. Click **Apply** → wait ~3–5 min. You'll get a URL like
   `https://ai-workout-backend.onrender.com`
6. Test it in a browser — visiting that URL should respond (not an error page).

> ⚠️ Render's free tier **sleeps after 15 min idle**; the first request then takes ~50s to wake. Fine for testing — just warn friends the first open may be slow.

---

## Part B — Point the app at the deployed backend

In **`src/constants/api.ts`**, change `API_URL` to your Render URL:

```ts
export const API_URL = "https://ai-workout-backend.onrender.com";
```

(Tell me the URL and I'll make this edit for you.)

---

## Part C — Build the Android APK (Expo EAS, free)

`eas.json` is already configured with a `preview` profile that outputs an installable APK.

```bash
npm install -g eas-cli
eas login          # create a free Expo account
eas init           # links the project (adds a projectId)
eas build -p android --profile preview
```

After ~10–15 min you get a **download link** (also on expo.dev → your project → Builds).

---

## Part D — Share with friends

1. Send them the APK download link.
2. On their Android phone: tap link → download `.apk` → tap to install.
3. When prompted, allow **"Install from unknown sources"** for their browser.
4. App runs like a normal app — no Expo Go needed.

💡 Make a quick **Google Form** (rating + "what broke?" + "what's confusing?") and include the link.

---

## Remember when iterating
- **App code changes** → rebuild the APK (Part C) and reshare. *(Or set up `eas update` later for over-the-air JS updates.)*
- **Backend changes** → just `git push`; Render auto-redeploys. No new APK needed.

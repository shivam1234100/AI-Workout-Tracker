# AI Workout Tracker — Engineering & Deployment Report

_Prepared for mentor review. Covers the changes shipped this iteration, the current
performance matrix, and a technical post-mortem of the deployment pipeline._

---

## 1. Changes Shipped This Iteration

### 1.1 Exercise Library — content & media layer
- Added a structured **`image`, `instructions[]` (step-by-step tutorial), and `videoUrl`**
  field to all 20 exercises in `src/constants/mockData.ts`.
- Wired the library to a verified, **CDN-hosted image source** (the open-source
  `free-exercise-db` over raw GitHub) after validating every URL returns HTTP 200,
  eliminating broken/blank thumbnails.
- Each exercise now exposes a **4–5 step "How to Perform" guide** plus a **YouTube
  tutorial deep-link** (search-query URLs, chosen for link-rot resistance over
  hard-coded video IDs).

### 1.2 Health module — from placeholder to real, personalized telemetry
- Eliminated generic/duplicated calorie logic and centralized it in a new
  **`src/lib/healthCalc.ts`** single-source-of-truth module:
  - **BMR** via the **Mifflin–St Jeor** equation, parameterized on the user's real
    weight / height / gender / age.
  - **Resting energy** accrued proportionally to elapsed day fraction.
  - **Active calories** derived from real pedometer step counts, **scaled by body mass**.
  - **Walking + running distance** from a **height-derived stride length** rather than a
    fixed constant.
- Added `age` to the user profile model to remove the previously hard-coded age
  assumption from the BMR calculation.
- Added the missing **motion-sensor permissions** (`NSMotionUsageDescription` on iOS,
  `ACTIVITY_RECOGNITION` on Android, plus the `expo-sensors` plugin `motionPermission`),
  without which the OS silently denies pedometer access and all derived metrics
  collapse to zero.
- Bumped the persisted health store key to force a one-time **state migration / wipe**
  of stale data and purge of orphaned AsyncStorage keys.

### 1.3 AI Coach — calculation transparency & correctness
- Fixed the maintenance-calorie (TDEE) explanation: the model previously received only
  the *result* and **hallucinated the derivation**. It now receives the full breakdown
  (BMR formula, the ×1.55 moderate-activity factor, and the assumed age) and an explicit
  system-prompt instruction to explain the math consistently.
- Added a dedicated **offline-responder branch** for "how are my calories calculated"
  queries that returns a correct, step-by-step derivation even when no LLM is reachable.
- Set **Gemini Flash as the default model** (frontend selection + backend fallback) so
  the assistant works out-of-the-box with a single free API key.

### 1.4 Deployment / DevOps infrastructure
- Authored a **Render Blueprint (`render.yaml`)** — Infrastructure-as-Code defining the
  web service, build/start commands, health-check path, and a set of `sync: false`
  (prompt-on-deploy) secret env vars so no credentials live in version control.
- Authored an **EAS build profile (`eas.json`)** with an `internal`-distribution
  `preview` profile that emits an installable Android **APK** (vs. a Play-Store AAB).
- Hardened the backend for a production runtime (see §3).
- Pointed the client `API_URL` at the deployed Render origin.
- Added `DEPLOY_AND_TEST.md` (deploy + distribution runbook) and this report.

---

## 2. Performance Matrix

Scored 1–5 on each axis. **C** = Completeness, **R** = Reliability, **UX** = Polish,
**E** = Competitive Edge. Ratings reflect the real state of the code.

| Feature | C | R | UX | E | Notes |
|---|:-:|:-:|:-:|:-:|---|
| Authentication (JWT, bcrypt) | 5 | 4 | 4 | 2 | Solid & standard; phone-auth scaffolded. |
| Workout Tracking | 5 | 4 | 4 | 3 | Live sets/reps/weight, timer, history. Core strength. |
| Exercise Library | 4 | 5 | 5 | 3 | Now with verified images, tutorials & video. |
| Programs (preset + builder) | 4 | 4 | 4 | 3 | PPL / 5×5 presets + custom program builder. |
| Health Dashboard | 4 | 3 | 5 | 4 | Real, body-personalized metrics; device-only sensor. |
| AI Coach (multi-model) | 4 | 3 | 4 | 5 | Biggest differentiator; reliability tied to API keys. |
| Medical-condition awareness | 3 | 2 | 3 | 5 | Injury-aware safety advice; uncommon in market. |
| Notifications | 4 | 4 | 4 | 2 | Scheduled motivational pushes. |
| Design system (themes) | 5 | 5 | 5 | 2 | Dark/light, consistent NativeWind UI. |
| Backend (Express/Prisma/Mongo) | 4 | 4 | – | 2 | Now production-deployed on Render. |

**Takeaway:** A polished full-stack app with a genuinely differentiated AI + health
layer. The foundation is built and now live in the cloud; the remaining work is
hardening reliability (API keys, observability) and deepening the AI's intelligence.

---

## 3. Deployment Post-Mortem — Technical Challenges

The backend was successfully containerized and deployed to a managed cloud platform
(Render) via a declarative Blueprint. Reaching a healthy running state required
resolving **several non-trivial runtime and build-pipeline issues** that are not
visible during local development. The Android APK build is the final remaining step and
was deferred only due to a time constraint — every upstream blocker has been resolved.

### 3.1 Production dependency-tree pruning (`NODE_ENV=production`)
The TypeScript execution runtime (`ts-node`) and the `typescript` compiler were declared
as **`devDependencies`**. Managed platforms set `NODE_ENV=production`, under which the
package manager **prunes the dev dependency tree**, so the entry point failed to resolve
its transpiler at boot. **Resolution:** promoted `ts-node`, `typescript`, and the Prisma
CLI into runtime `dependencies` and switched the start script to
`ts-node --transpile-only` to bypass type-checking on the hot path and reduce cold-start
latency.

### 3.2 ORM client generation in the build lifecycle
The Prisma client is a **code-generated artifact** that does not exist until
`prisma generate` runs against the schema; it is intentionally git-ignored. A fresh CI
checkout therefore had no generated client. **Resolution:** added a **`postinstall`
lifecycle hook** invoking `prisma generate`, binding client generation deterministically
to the dependency-install phase of the build.

### 3.3 Eager module-instantiation crash on absent secrets
The transactional-email SDK (Resend) was **instantiated at module top-level** with
`new Resend(process.env.RESEND_API_KEY)`. The SDK **throws synchronously on an
empty/undefined key**, and because the module is imported transitively by the server
entry point, this propagated as an **unhandled exception during the import graph
resolution**, terminating the process with a non-zero exit (status 1) before the HTTP
listener bound. This manifested as two consecutive failed deploys. The failure was
**environment-specific** (the local `.env` carried the key, the cloud environment did
not), making it invisible in local runs. **Resolution:** converted the client to
**lazy/guarded instantiation** (constructed only when the key is present) and gated the
send path on the client instance — i.e., graceful degradation of an optional subsystem.

### 3.4 Managed-platform networking & data-tier access control
The deployment runs behind **dynamic, ephemeral egress IPs**, which are incompatible
with a fixed-IP allowlist on the managed MongoDB Atlas cluster. This requires widening
the database **network-access policy** (CIDR `0.0.0.0/0`) so the stateless compute tier
can reach the data tier. Additionally, the free compute tier **spins down on inactivity**,
introducing a **cold-start latency** (~50s) on the first request after idle — a
documented characteristic of scale-to-zero infrastructure.

### 3.5 Client/host environment resolution (toolchain PATH)
On the build machine, the globally-installed EAS CLI binary was placed under a custom
npm global prefix (`~/.npm-global/bin`) that was **not present on the shell's `PATH`**,
so the `eas` executable failed to resolve (`command not found`). **Resolution:** appended
the npm global bin directory to the shell init file (`~/.zshrc`); `npx eas-cli` provides
an equivalent path-independent invocation.

### 3.6 Remaining step — EAS cloud build (deferred, not blocked)
The Android binary is produced by **EAS Build**, a remote/cloud build service that
provisions a managed Gradle toolchain, compiles the React Native project, and returns a
signed APK artifact (~10–15 min). This step requires an authenticated Expo session and
is the **only outstanding item**; all configuration (`eas.json` preview profile,
`API_URL` repointing, backend availability) is already in place. It was paused solely due
to a scheduling constraint and can be completed in a single command:
`eas build -p android --profile preview`.

### Summary
Local correctness does **not** imply deployment correctness. The blockers encountered —
dependency-pruning under production installs, code-generated ORM artifacts, eager
instantiation against absent secrets, ephemeral-IP data-tier access, and host PATH
resolution — are representative real-world DevOps concerns. Each was diagnosed and
resolved; the backend is now **live and returning HTTP 200**, and the client APK build is
a single, unblocked command away.

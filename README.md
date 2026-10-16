# FrameForge — AI Video Studio

A responsive AI video-generation website powered by OpenRouter and Cloudflare Pages Functions.

## Features
- Live OpenRouter video-model catalog
- Responsive cinematic UI with prompt, aspect ratio, duration, resolution, and optional audio controls
- Asynchronous generation status polling, video preview, and download
- OpenRouter key stays server-side in a Cloudflare secret
- No frontend build step required

## Deploy on Cloudflare

This repository uses **Cloudflare Pages Functions**, not a standalone Workers entry point. Do not use `npx wrangler deploy` as the deploy command; it targets a Workers deployment and can fail for this Pages project.

### Option A — Recommended: Pages connected to Git
1. In Cloudflare Dashboard, open **Workers & Pages** and create/select a **Pages** project connected to `nafiulnahid17/video-tool-`.
2. Set production branch to `main`.
3. Set **Build command** to blank / none.
4. Set **Build output directory** to `public`.
5. In **Settings → Variables and Secrets**, add `OPENROUTER_API_KEY` as an encrypted secret for production (and preview if needed).
6. Trigger a new deployment.

### Option B — Deploy with Wrangler
First create the Cloudflare Pages project in the dashboard. Then run this from the repository root:

```sh
npx wrangler pages deploy public --project-name=frameforge-video-studio
```

If your existing Pages project has a different name, replace `frameforge-video-studio` with that exact project name. In Cloudflare Workers Builds, if a separate deploy command is required, use the command above — **not** `npx wrangler deploy`. Leave the build command empty because the static site has no build step.

### API secret
Set `OPENROUTER_API_KEY` in the Cloudflare dashboard as an encrypted secret. Never commit the real key in GitHub, a `.env` file, or frontend code. The secret is required for generation, but its absence does not usually cause the static deployment itself to fail.

## Local development

Create a root-level `.dev.vars` file (never commit it) containing:

```dotenv
OPENROUTER_API_KEY=sk-or-v1-your-real-key
```

Then run:

```sh
npx wrangler pages dev public
```

## API routes
- `GET /api/models` — live OpenRouter video-model catalog
- `POST /api/videos` — submit a video generation job
- `GET /api/videos/:id` — poll generation status
- `GET /api/videos/:id/content?index=0` — retrieve generated video content

OpenRouter generation is asynchronous. Model options vary; if a provider rejects a duration or resolution, select a supported configuration. Video generation may incur OpenRouter charges.

## Security
Anyone who can access the deployed site may trigger billable jobs using the configured key. Before sharing publicly, add authentication, rate limits/quotas, and abuse protection such as Cloudflare Turnstile.

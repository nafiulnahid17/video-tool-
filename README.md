# FrameForge — AI Video Studio

A responsive, polished AI video generation website powered by OpenRouter and Cloudflare Pages Functions.

## Features
- Live OpenRouter video-model catalog
- Cinematic responsive UI for desktop and mobile
- Prompt, aspect ratio, duration, resolution, and optional audio controls
- Asynchronous job status polling, in-page video preview, and MP4 download
- API key stays in a server-side Cloudflare secret; it is never exposed to browser JavaScript
- No frontend framework or npm build required

## Deploy to Cloudflare Pages
1. In Cloudflare Dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and select `nafiulnahid17/video-tool-`.
2. Select production branch `main`.
3. Set the build command to blank / none and **Build output directory** to `public`.
4. Under the Pages project **Settings → Variables and Secrets**, add `OPENROUTER_API_KEY` as an **encrypted secret** and paste your OpenRouter API key.
5. Deploy and open the generated `*.pages.dev` address.

The repository includes `wrangler.toml` with `pages_build_output_dir = "./public"`. Do not put your real key in GitHub, a committed `.env`, or frontend code.

## Local development
Install Wrangler, create a root-level `.dev.vars` file (never commit it), and run:

```sh
npm install --save-dev wrangler
# .dev.vars contents:
# OPENROUTER_API_KEY=sk-or-v1-your-real-key
npx wrangler pages dev public
```

## API routes
- `GET /api/models` — live video model catalog
- `POST /api/videos` — submit a video generation job
- `GET /api/videos/:id` — poll generation status
- `GET /api/videos/:id/content?index=0` — authenticated video download stream

OpenRouter generation is asynchronous: submit, poll until completed, then download. Model-specific options vary; if a provider rejects a duration or resolution, choose a supported configuration. Generation incurs OpenRouter charges.

## Security
This is intended as a personal tool. Anyone who can access the deployed site may trigger billable jobs using the configured key. Before sharing publicly, add authentication, rate limits/quotas, and abuse protection such as Cloudflare Turnstile.

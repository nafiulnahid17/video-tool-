# FrameForge — AI Video Studio

A responsive AI video-generation website powered by OpenRouter and Cloudflare Workers.

## Features
- Live OpenRouter video-model catalog
- Responsive cinematic UI with prompt, aspect ratio, duration, resolution, and optional audio controls
- Asynchronous generation status polling, video preview, and download
- OpenRouter API key stays server-side in a Cloudflare secret
- Static assets served by Cloudflare Workers Static Assets; no frontend build step required

## Deploy

This repository is configured as a **Cloudflare Worker with Static Assets**, so the configured command `npx wrangler deploy` works. It is no longer configured as a Pages project.

1. In Cloudflare, open **Workers & Pages** and create or select the Worker named `frameforge-video-studio`.
2. Connect the GitHub repository `nafiulnahid17/video-tool-` to Workers Builds if deploying automatically from Git.
3. Set the deploy command to `npx wrangler deploy`. No build command is required.
4. In the Worker settings, add `OPENROUTER_API_KEY` as an encrypted secret. Paste your OpenRouter API key.
5. Deploy and open the Worker URL.

The repository's `wrangler.toml` declares `src/index.js` as the Worker entrypoint and `public` as its static-assets directory. The Worker handles `/api/*` requests and serves the website assets.

If you already created a **Pages** project for this repository, create/use a **Worker** deployment for this configuration rather than keeping it attached to the Pages deploy workflow. The code and config are now designed for Workers, not Pages.

## Local development

Create a root-level `.dev.vars` file (never commit it) containing:

```dotenv
OPENROUTER_API_KEY=sk-or-v1-your-real-key
```

Then run:

```sh
npm install
npm run dev
```

## API routes
- `GET /api/models` — live OpenRouter video-model catalog
- `POST /api/videos` — submit a video generation job
- `GET /api/videos/:id` — poll generation status
- `GET /api/videos/:id/content?index=0` — retrieve generated video content

OpenRouter generation is asynchronous. Model options vary; if a provider rejects a duration or resolution, select a supported configuration. Video generation may incur OpenRouter charges.

## Security
Anyone who can access the deployed site may trigger billable jobs using the configured key. Before sharing publicly, add authentication, rate limits/quotas, and abuse protection such as Cloudflare Turnstile.

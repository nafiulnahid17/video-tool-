# FrameForge — AI Video Studio

A responsive AI video-generation website powered by OpenRouter and Cloudflare Pages Functions.

## Features
- Live OpenRouter video-model catalog
- Responsive cinematic UI with prompt, aspect ratio, duration, resolution, and optional audio controls
- Asynchronous generation status polling, video preview, and download
- OpenRouter API key stays server-side in a Cloudflare secret
- Static website hosted from `public/`; API handled by Cloudflare Pages Functions

## Deploy to the existing Cloudflare Pages project

This repository uses **Cloudflare Pages**, including the `functions/` directory for API routes. Do not run `npx wrangler deploy` here; that command deploys a Worker and is the cause of the Pages-project warning/error.

1. In Cloudflare, open **Workers & Pages** and select the existing **Pages** project connected to this repository.
2. Open **Settings → Builds & deployments** (the exact label may vary) and set the deploy command to:

   ```sh
   npx wrangler pages deploy public --project-name YOUR_ACTUAL_PAGES_PROJECT_NAME
   ```

   Replace `YOUR_ACTUAL_PAGES_PROJECT_NAME` with the exact Pages project name shown in the Cloudflare dashboard. Keep the repository root as the root directory. No frontend build step is required.
3. Add `OPENROUTER_API_KEY` as an encrypted secret for the Pages project, then redeploy.
4. Confirm the latest deployment is using the current `main` branch.

The `wrangler.toml` now declares `pages_build_output_dir = "./public"`. API routes live in `functions/api/` and are deployed as Pages Functions.

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

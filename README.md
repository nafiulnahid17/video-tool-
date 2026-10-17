# FrameForge — AI Video Studio

A responsive AI video-generation app hosted on **Cloudflare Workers with Static Assets**, powered by OpenRouter.

## Features

- Live OpenRouter video-model catalog
- Responsive cinematic interface with prompt, aspect ratio, duration, resolution, and optional audio controls
- Asynchronous generation status polling, video preview, and download
- Server-side OpenRouter API key stored as a Cloudflare secret
- Static frontend served from `public/`; API requests handled by the Worker in `src/index.js`

## Deploy as a Cloudflare Worker

This is a **Workers** project, not a Cloudflare Pages project.

1. In Cloudflare, open **Workers & Pages** and create or select the **Worker** named `video-tool`. If a Pages project with that name exists, it is a separate deployment type; deploy this repository as a Worker instead.
2. Connect GitHub repository `nafiulnahid17/video-tool-` on branch `main` using Cloudflare Workers Builds.
3. Configure the build settings:
   - Root directory: `/`
   - Build command: leave blank
   - Deploy command: `npx wrangler deploy`
4. Ensure the Worker build uses the repository's `wrangler.toml`. It defines `src/index.js` as the entry point and `public/` as static assets.
5. In the Worker settings, add `OPENROUTER_API_KEY` as an encrypted secret. Do not put the key in source code or commit it.
6. Deploy, then test the Worker URL:
   - `GET /api/models` — list available video models
   - `POST /api/videos` — create a video generation job
   - `GET /api/videos/:id` — poll generation status
   - `GET /api/videos/:id/content?index=0` — download the generated video

## Local development

Create a root-level `.dev.vars` file (it is ignored by Git) containing:

```dotenv
OPENROUTER_API_KEY=sk-or-v1-your-real-key
```

Then run:

```sh
npm install
npm run dev
```

Deploy manually with:

```sh
npm run deploy
```

## Security and costs

Anyone who can access the deployed site may be able to trigger billable video-generation jobs through the configured key. Before sharing publicly, add authentication, rate limits/quotas, and abuse protection such as Cloudflare Turnstile.

Video generation is asynchronous and may incur OpenRouter charges. Supported durations, aspect ratios, and resolutions depend on the selected model.

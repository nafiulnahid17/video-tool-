const json = (data, status = 200, extra = {}) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });

const methodNotAllowed = () => json({ error: "Method not allowed" }, 405);

function upstreamHeaders(request, env, jsonBody = false) {
  const headers = {
    Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": new URL(request.url).origin,
    "X-Title": "FrameForge AI Video Studio",
  };
  if (jsonBody) headers["Content-Type"] = "application/json";
  return headers;
}

function upstreamJson(response, cache = "no-store") {
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json; charset=utf-8",
      "Cache-Control": cache,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!path.startsWith("/api/")) return env.ASSETS.fetch(request);

  if (!env.OPENROUTER_API_KEY) {
    return json({ error: "Missing OPENROUTER_API_KEY Cloudflare secret." }, 503);
  }

  if (path === "/api/models") {
    if (request.method !== "GET") return methodNotAllowed();
    try {
      const upstream = await fetch("https://openrouter.ai/api/v1/videos/models", {
        headers: upstreamHeaders(request, env),
      });
      return upstreamJson(upstream, "public, max-age=300");
    } catch {
      return json({ error: "Could not reach the OpenRouter model catalog." }, 502);
    }
  }

  if (path === "/api/videos") {
    if (request.method !== "POST") return methodNotAllowed();
    let input;
    try {
      input = await request.json();
    } catch {
      return json({ error: "Request body must be valid JSON." }, 400);
    }

    const prompt = typeof input.prompt === "string" ? input.prompt.trim() : "";
    const model = typeof input.model === "string" ? input.model.trim() : "";
    if (!prompt) return json({ error: "Describe the video you want to generate." }, 400);
    if (prompt.length > 4000) return json({ error: "Prompt must be 4,000 characters or fewer." }, 400);
    if (!model || model.length > 200 || !/^[a-zA-Z0-9._/-]+$/.test(model)) {
      return json({ error: "Choose a valid model from the video catalog." }, 400);
    }

    const payload = { model, prompt };
    const ratios = ["16:9", "9:16", "1:1", "4:3", "3:4", "auto"];
    const resolutions = ["480p", "720p", "1080p", "4k"];
    if (ratios.includes(input.aspect_ratio)) payload.aspect_ratio = input.aspect_ratio;
    if (Number.isInteger(input.duration) && input.duration >= 1 && input.duration <= 30) payload.duration = input.duration;
    if (resolutions.includes(input.resolution)) payload.resolution = input.resolution;
    if (typeof input.generate_audio === "boolean") payload.generate_audio = input.generate_audio;

    try {
      const upstream = await fetch("https://openrouter.ai/api/v1/videos", {
        method: "POST",
        headers: upstreamHeaders(request, env, true),
        body: JSON.stringify(payload),
      });
      return upstreamJson(upstream);
    } catch {
      return json({ error: "Could not reach OpenRouter. Please try again." }, 502);
    }
  }

  const match = path.match(/^\/api\/videos\/([^/]+)(?:\/content)?\/?$/);
  if (match) {
    let id;
    try {
      id = decodeURIComponent(match[1]);
    } catch {
      return json({ error: "Invalid video job ID." }, 400);
    }
    if (!/^[a-zA-Z0-9_-]{1,200}$/.test(id)) return json({ error: "Invalid video job ID." }, 400);

    const isContent = path.endsWith("/content") || path.endsWith("/content/");
    if (request.method !== "GET") return methodNotAllowed();

    if (isContent) {
      const index = url.searchParams.get("index") || "0";
      if (!/^\d{1,3}$/.test(index)) return json({ error: "Invalid video index." }, 400);
      try {
        const upstream = await fetch(
          `https://openrouter.ai/api/v1/videos/${encodeURIComponent(id)}/content?index=${index}`,
          { headers: upstreamHeaders(request, env) },
        );
        if (!upstream.ok) {
          return new Response(upstream.body, {
            status: upstream.status,
            headers: {
              "Content-Type": upstream.headers.get("Content-Type") || "application/json",
              "Cache-Control": "no-store",
            },
          });
        }
        const headers = new Headers({
          "Content-Type": upstream.headers.get("Content-Type") || "video/mp4",
          "Content-Disposition": 'attachment; filename="frameforge-video.mp4"',
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        });
        const length = upstream.headers.get("Content-Length");
        if (length) headers.set("Content-Length", length);
        return new Response(upstream.body, { status: 200, headers });
      } catch {
        return json({ error: "Could not download the video. Please retry." }, 502);
      }
    }

    try {
      const upstream = await fetch(
        `https://openrouter.ai/api/v1/videos/${encodeURIComponent(id)}`,
        { headers: upstreamHeaders(request, env) },
      );
      return upstreamJson(upstream);
    } catch {
      return json({ error: "Could not check generation status." }, 502);
    }
  }

  return json({ error: "API route not found." }, 404);
}

export default {
  async fetch(request, env) {
    try {
      return await handleApi(request, env);
    } catch {
      return json({ error: "Unexpected server error." }, 500);
    }
  },
};

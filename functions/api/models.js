export async function onRequest({ request, env }) {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
  if (!env.OPENROUTER_API_KEY) return Response.json({ error: "Missing OPENROUTER_API_KEY Cloudflare secret." }, { status: 503 });
  try {
    const r = await fetch("https://openrouter.ai/api/v1/videos/models", { headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, "HTTP-Referer": new URL(request.url).origin, "X-Title": "FrameForge AI Video Studio" } });
    return new Response(await r.text(), { status: r.status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" } });
  } catch { return Response.json({ error: "Could not reach the OpenRouter model catalog." }, { status: 502 }); }
}
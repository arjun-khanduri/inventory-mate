/**
 * Cloudflare Worker proxy for the Gemini API.
 *
 * The browser calls this worker (it never touches your Gemini key directly).
 * Deploy with:
 *   npx wrangler deploy
 * and set the secret:
 *   npx wrangler secret put GEMINI_API_KEY
 *
 * The model can be overridden per request via the `model` field in the body.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (url.pathname !== "/" || request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });
    }
    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Worker is missing GEMINI_API_KEY" }), {
        status: 500,
        headers,
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
    }

    const model = typeof body.model === "string" ? body.model : "gemini-3-flash-preview";
    const upstream = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const resp = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: body.contents,
        generationConfig: body.generationConfig,
      }),
    });

    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: resp.status, headers });
  },
};

/**
 * Cloudflare Worker proxy for the Groq chat API (hosted open-weight models:
 * Llama / Mistral / Qwen / DeepSeek-R1). The browser calls this worker; it
 * never touches your Groq key directly.
 *
 * Deploy with:
 *   npx wrangler deploy
 * and set the secret:
 *   npx wrangler secret put GROQ_API_KEY
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
    if (!env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "Worker is missing GROQ_API_KEY" }), {
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

    const model = typeof body.model === "string" ? body.model : "qwen/qwen3.8-27b";

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        response_format: body.response_format,
      }),
    });

    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: resp.status, headers });
  },
};

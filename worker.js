/**
 * Otherworld AI proxy — Cloudflare Worker
 * Garde ta clé API secrète côté serveur. L'app envoie { system, messages, ... } et reçoit { reply }.
 *
 * Variables à définir dans Cloudflare (Settings → Variables and Secrets) :
 *   OPENROUTER_API_KEY  (Secret)  ta clé OpenRouter
 *   MODEL               (texte)   ex : deepseek/deepseek-chat   (nom exact sur openrouter.ai/models)
 *   ALLOWED_ORIGIN      (texte, optionnel mais recommandé) l'adresse de ton app, ex : https://monsite.github.io
 */
const API = "https://openrouter.ai/api/v1/chat/completions";

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allowed === "*" ? "*" : allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (req.method !== "POST") return json({ error: "POST uniquement" }, 405);
    if (allowed !== "*" && origin !== allowed) return json({ error: "Origine non autorisée" }, 403);
    if (!env.OPENROUTER_API_KEY) return json({ error: "OPENROUTER_API_KEY manquante côté serveur" }, 500);

    let body;
    try { body = await req.json(); } catch { return json({ error: "JSON invalide" }, 400); }

    const system = String(body.system || "").slice(0, 24000);
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .slice(-60)
      .map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 8000) }));
    if (!messages.length) return json({ error: "messages vide" }, 400);

    const payload = {
      model: env.MODEL || "deepseek/deepseek-chat",   // le modèle est choisi ici, pas par le navigateur (évite les abus)
      messages: [{ role: "system", content: system }, ...messages],
      max_tokens: Math.min(Number(body.max_tokens) || 500, 1200),
      temperature: Math.min(Math.max(Number(body.temperature) || 0.9, 0), 1.3),
      top_p: 0.95,
      frequency_penalty: 0.3,
    };

    const r = await fetch(API, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.OPENROUTER_API_KEY,
        "Content-Type": "application/json",
        "X-Title": "Otherworld",
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => null);
    if (!r.ok) return json({ error: (data && data.error && data.error.message) || ("Erreur fournisseur " + r.status) }, r.status);
    const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!reply) return json({ error: "Réponse vide du modèle" }, 502);
    return json({ reply });
  },
};

import { validateInput, buildMessages } from "./diagnostico-core.js";
import { createRateLimiter, clientIp } from "./rate-limit.js";

export function createHandler(client, options = {}) {
  const model =
    String(options.model || "openai/gpt-oss-20b")
      .trim()
      .replace(/^["']+|["']+$/g, "")
      .trim() || "openai/gpt-oss-20b";
  const maxTokens = Number(options.maxTokens || 2048);
  const allow = options.rateLimiter || createRateLimiter();
  return async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido." });
    }
    if (!allow(clientIp(req))) {
      return res.status(429).json({ error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." });
    }
    const body = req.body ?? {};
    const check = validateInput(body);
    if (!check.ok) {
      return res.status(400).json({ error: check.error });
    }
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: buildMessages(body),
        temperature: 0.5,
        max_tokens: maxTokens,
      });
      const diagnostico = (completion?.choices?.[0]?.message?.content || "").trim();
      if (!diagnostico) {
        return res.status(502).json({ error: "No se pudo generar el diagnóstico. Intenta más tarde." });
      }
      return res.status(200).json({ diagnostico });
    } catch (err) {
      console.error("[diagnostico] error del proveedor de IA:", err?.status, err?.message);
      return res.status(502).json({ error: "No se pudo generar el diagnóstico. Intenta más tarde." });
    }
  };
}

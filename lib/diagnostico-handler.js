import { validateInput, buildMessages } from "./diagnostico-core.js";

export function createHandler(client, options = {}) {
  const model = options.model || process.env.NVIDIA_MODEL || "openai/gpt-oss-20b";
  const maxTokens = Number(options.maxTokens || process.env.NVIDIA_MAX_TOKENS || 4096);
  return async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido." });
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
      const choice = completion?.choices?.[0];
      const diagnostico = (choice?.message?.content || "").trim();
      if (!diagnostico) {
        console.error("[diagnostico] respuesta sin contenido:", JSON.stringify(choice)?.slice(0, 600));
        return res.status(502).json({
          error: "No se pudo generar el diagnóstico. Intenta más tarde.",
          _debug: {
            reason: "empty_content",
            finish_reason: choice?.finish_reason,
            content_len: (choice?.message?.content || "").length,
            reasoning_len: (choice?.message?.reasoning_content || "").length,
          },
        });
      }
      return res.status(200).json({ diagnostico });
    } catch (err) {
      console.error("[diagnostico] fallo IA:", err?.status, err?.message);
      return res.status(502).json({
        error: "No se pudo generar el diagnóstico. Intenta más tarde.",
        _debug: { reason: "exception", status: err?.status ?? null, message: String(err?.message ?? err).slice(0, 300) },
      });
    }
  };
}

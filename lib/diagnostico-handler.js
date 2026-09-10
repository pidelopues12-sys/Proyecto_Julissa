import { validateInput, buildMessages } from "./diagnostico-core.js";

export function createHandler(client, options = {}) {
  const model = options.model || process.env.NVIDIA_MODEL || "openai/gpt-oss-20b";
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
        max_tokens: 800,
      });
      const diagnostico = completion?.choices?.[0]?.message?.content?.trim();
      if (!diagnostico) {
        return res.status(502).json({ error: "No se pudo generar el diagnóstico. Intenta más tarde." });
      }
      return res.status(200).json({ diagnostico });
    } catch (err) {
      return res.status(502).json({ error: "No se pudo generar el diagnóstico. Intenta más tarde." });
    }
  };
}

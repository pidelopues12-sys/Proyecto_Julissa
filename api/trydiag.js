// TEMPORAL: prueba invocar un modelo dado por ?model= y reporta tiempo/errores.
// Sirve para encontrar un modelo invocable y rápido. Eliminar tras elegir.
import OpenAI from "openai";
import { buildMessages } from "../lib/diagnostico-core.js";

const apiKey = (process.env.GROQ_API_KEY || "")
  .trim()
  .replace(/^["']+|["']+$/g, "")
  .trim();

const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

const SAMPLE = {
  contacto: { nombre: "Prueba", empresa: "Prueba SRL", whatsapp: "809" },
  respuestas: {
    tipoNegocio: "SRL", empleados: "1-5", contabilidad: "No",
    dgii: "Con atrasos", ncf: "A veces", estados: "Solo anual",
    preocupacion: "Ordenar finanzas",
  },
};

export default async function handler(req, res) {
  if (req.query?.check) {
    res.status(200).json({
      groq: {
        keyPresent: apiKey.length > 0,
        keyLen: apiKey.length,
        keyPrefix: apiKey.slice(0, 4),
        startsWithGsk: apiKey.startsWith("gsk_"),
      },
      envKeys: Object.keys(process.env).filter((k) => /GROQ|NVIDIA|META/i.test(k)),
    });
    return;
  }
  const model = String(req.query?.model || "").trim();
  const max = Number(req.query?.max || 1024);
  if (!model) {
    res.status(400).json({ error: "pasa ?model=<id>" });
    return;
  }
  const effort = String(req.query?.effort || "").trim();
  const t0 = Date.now();
  try {
    const params = {
      model,
      messages: buildMessages(SAMPLE),
      temperature: 0.5,
      max_tokens: max,
    };
    if (effort) {
      params.reasoning_effort = effort;
      params.chat_template_kwargs = { reasoning_effort: effort };
    }
    const c = await client.chat.completions.create(params);
    const msg = c?.choices?.[0]?.message;
    res.status(200).json({
      ok: true, model, ms: Date.now() - t0,
      contentLen: (msg?.content || "").length,
      reasoningLen: (msg?.reasoning_content || "").length,
      finish: c?.choices?.[0]?.finish_reason,
      preview: (msg?.content || "").slice(0, 200),
    });
  } catch (err) {
    res.status(200).json({
      ok: false, model, ms: Date.now() - t0,
      status: err?.status ?? null,
      error: String(err?.message ?? err).slice(0, 200),
    });
  }
}

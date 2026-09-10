// TEMPORAL: lista los modelos disponibles en el endpoint de NVIDIA para elegir
// uno vigente. Eliminar este archivo tras seleccionar el modelo.
import OpenAI from "openai";

const apiKey = (process.env.NVIDIA_API_KEY || "")
  .trim()
  .replace(/^["']+|["']+$/g, "")
  .trim();

const client = new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });

export default async function handler(req, res) {
  try {
    const page = await client.models.list();
    const data = page?.data || page?.body?.data || [];
    const ids = data.map((m) => m.id).sort();
    res.status(200).json({ count: ids.length, ids });
  } catch (err) {
    res.status(502).json({ error: String(err?.message ?? err), status: err?.status ?? null });
  }
}

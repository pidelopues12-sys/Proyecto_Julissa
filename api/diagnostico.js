import OpenAI from "openai";
import { createHandler } from "../lib/diagnostico-handler.js";

// Resuelve la base URL de forma robusta: limpia espacios y comillas que a
// veces se cuelan al pegar variables de entorno, y si el valor no es una URL
// válida, cae al endpoint correcto de NVIDIA por defecto.
function resolveBaseURL() {
  const fallback = "https://integrate.api.nvidia.com/v1";
  const raw = (process.env.NVIDIA_BASE_URL || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
  if (!raw) return fallback;
  try {
    const u = new URL(raw);
    // El endpoint OpenAI-compatible vive bajo /v1; si falta, el SDK pega en
    // una ruta inexistente (404). En ese caso usamos el correcto por defecto.
    if (!/\/v\d+(\/|$)/.test(u.pathname)) return fallback;
    return raw.replace(/\/+$/, "");
  } catch {
    return fallback;
  }
}

const client = new OpenAI({
  apiKey: (process.env.NVIDIA_API_KEY || "").trim(),
  baseURL: resolveBaseURL(),
});

export default createHandler(client);

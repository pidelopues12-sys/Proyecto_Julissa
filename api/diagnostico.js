import OpenAI from "openai";
import { createHandler } from "../lib/diagnostico-handler.js";

// El endpoint OpenAI-compatible de NVIDIA es fijo para esta integración.
// Lo fijamos en código para evitar errores de ruta (404 / "Invalid URL")
// por un valor mal configurado de NVIDIA_BASE_URL en el entorno.
const BASE_URL = "https://integrate.api.nvidia.com/v1";
// Modelo rápido (no-razonamiento) para respuesta en segundos. Fijo en código
// para evitar valores mal configurados de NVIDIA_MODEL en el entorno.
const MODEL = "meta/muse-glimmer-30b";

// Lee la key de META_API_KEY o NVIDIA_API_KEY y limpia comillas/espacios que a
// veces se cuelan al pegar el valor en el panel.
const apiKey = (process.env.META_API_KEY || process.env.NVIDIA_API_KEY || "")
  .trim()
  .replace(/^["']+|["']+$/g, "")
  .trim();

const client = new OpenAI({
  apiKey,
  baseURL: BASE_URL,
});

export default createHandler(client, { baseURL: BASE_URL, model: MODEL });

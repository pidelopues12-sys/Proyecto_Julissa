import OpenAI from "openai";
import { createHandler } from "../lib/diagnostico-handler.js";

// El endpoint OpenAI-compatible de NVIDIA es fijo para esta integración.
// Lo fijamos en código para evitar errores de ruta (404 / "Invalid URL")
// por un valor mal configurado de NVIDIA_BASE_URL en el entorno.
const BASE_URL = "https://integrate.api.nvidia.com/v1";

const client = new OpenAI({
  apiKey: (process.env.NVIDIA_API_KEY || "").trim(),
  baseURL: BASE_URL,
});

export default createHandler(client, { baseURL: BASE_URL });

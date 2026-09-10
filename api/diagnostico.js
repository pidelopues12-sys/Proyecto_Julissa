import OpenAI from "openai";
import { createHandler } from "../lib/diagnostico-handler.js";

// Proveedor: Groq (OpenAI-compatible), rápido (~1-3 s) y con buen español.
// Base URL y modelo fijos en código para evitar valores mal configurados en
// el entorno; la API key se lee de GROQ_API_KEY.
const BASE_URL = "https://api.groq.com/openai/v1";
const MODEL = "llama-3.3-70b-versatile";

// Limpia comillas/espacios que a veces se cuelan al pegar el valor en el panel.
const apiKey = (process.env.GROQ_API_KEY || "")
  .trim()
  .replace(/^["']+|["']+$/g, "")
  .trim();

const client = new OpenAI({
  apiKey,
  baseURL: BASE_URL,
});

export default createHandler(client, { baseURL: BASE_URL, model: MODEL });

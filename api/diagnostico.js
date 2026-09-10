import OpenAI from "openai";
import { createHandler } from "../lib/diagnostico-handler.js";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

export default createHandler(client);

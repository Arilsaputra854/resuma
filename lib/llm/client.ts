// Groq LLM client (OpenAI-compatible) — LLM layer for ATS feedback + bullet
// rewrite (plan.md §4.3/§4.2). Server only. Premium-gated by callers.
import "server-only";
import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getGroq(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY missing");
  _client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
  return _client;
}

// Single model for this app: gpt-oss-120b on Groq. Fast + cheap + good enough
// for both rewrite and ATS feedback. Aliases kept for call-site clarity.
export const MODEL_FAST = "openai/gpt-oss-120b";
export const MODEL_SMART = "openai/gpt-oss-120b";

import type { VercelRequest, VercelResponse } from "@vercel/node"
import OpenAI from "openai"

// --- Error classes ---

class AnalysisError extends Error {
  statusCode: number
  code: string
  constructor(message: string, statusCode = 500, code = "ANALYSIS_ERROR") {
    super(message)
    this.name = "AnalysisError"
    this.statusCode = statusCode
    this.code = code
  }
}

class ApiKeyError extends AnalysisError {
  constructor() {
    super("API key not configured. Set OPENROUTER_API_KEY in Vercel environment variables", 503, "API_KEY_MISSING")
  }
}

// --- OpenRouter client ---

const OPENROUTER_MODEL = "openai/gpt-5-nano"

function createClient(referer: string) {
  if (!process.env.OPENROUTER_API_KEY) return null
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": referer,
      "X-Title": "VAMS Academic Data Tracker",
    },
  })
}

// --- Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" })
  }

  try {
    const origin =
      req.headers.origin ||
      req.headers.referer ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173")

    const openrouter = createClient(String(origin))
    if (!openrouter) throw new ApiKeyError()

    const { prompt, studentProfile } = req.body
    if (!prompt || !studentProfile) {
      throw new AnalysisError("Missing prompt or studentProfile in request body", 400, "VALIDATION_ERROR")
    }

    const result = await openrouter.chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      // @ts-expect-error -- OpenRouter-specific field
      provider: { data_collection: "allow" },
    })

    const text = result.choices[0]?.message?.content ?? ""

    return res.status(200).json({
      analysis: text,
      model: result.model ?? OPENROUTER_MODEL,
      usage: {
        input_tokens: result.usage?.prompt_tokens ?? 0,
        output_tokens: result.usage?.completion_tokens ?? 0,
      },
    })
  } catch (err: unknown) {
    if (err instanceof AnalysisError) {
      return res.status(err.statusCode).json({ error: err.message, code: err.code })
    } else if (err instanceof Error) {
      const msg = err.message
      console.error("Analysis endpoint error:", msg)

      if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
        return res.status(429).json({ error: "OpenRouter rate limit exceeded. Check your plan at https://openrouter.ai/settings/limits", code: "QUOTA_EXCEEDED" })
      } else if (msg.includes("API key") || msg.includes("401") || msg.includes("403")) {
        return res.status(502).json({ error: "Invalid or unauthorized OpenRouter API key", code: "AUTH_ERROR" })
      } else {
        return res.status(502).json({ error: "OpenRouter API error: " + msg, code: "API_ERROR" })
      }
    } else {
      console.error("Analysis endpoint error:", err)
      return res.status(500).json({ error: "An unexpected error occurred during analysis", code: "INTERNAL_ERROR" })
    }
  }
}

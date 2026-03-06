import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"

dotenv.config()

// --- Error classes (per handling-errors skill) ---

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
    super("API key not configured. Set OPENROUTER_API_KEY in .env", 503, "API_KEY_MISSING")
  }
}

// --- Server setup ---

const app = express()
app.use(cors())
app.use(express.json({ limit: "1mb" }))

const OPENROUTER_MODEL = "openai/gpt-5-nano"

const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "VAMS Academic Data Tracker",
      },
    })
  : null

app.post("/api/analyze", async (req, res) => {
  try {
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

    res.json({
      analysis: text,
      model: result.model ?? OPENROUTER_MODEL,
      usage: {
        input_tokens: result.usage?.prompt_tokens ?? 0,
        output_tokens: result.usage?.completion_tokens ?? 0,
      },
    })
  } catch (err: unknown) {
    if (err instanceof AnalysisError) {
      res.status(err.statusCode).json({ error: err.message, code: err.code })
    } else if (err instanceof Error) {
      const msg = err.message
      console.error("Analysis endpoint error:", msg)

      if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
        res.status(429).json({ error: "OpenRouter rate limit exceeded. Check your plan at https://openrouter.ai/settings/limits", code: "QUOTA_EXCEEDED" })
      } else if (msg.includes("API key") || msg.includes("401") || msg.includes("403")) {
        res.status(502).json({ error: "Invalid or unauthorized OpenRouter API key. Check OPENROUTER_API_KEY in .env", code: "AUTH_ERROR" })
      } else {
        res.status(502).json({ error: "OpenRouter API error: " + msg, code: "API_ERROR" })
      }
    } else {
      console.error("Analysis endpoint error:", err)
      res.status(500).json({ error: "An unexpected error occurred during analysis", code: "INTERNAL_ERROR" })
    }
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`))

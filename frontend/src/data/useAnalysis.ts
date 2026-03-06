import { useState, useCallback } from "react"
import type { StudentProfile } from "@/lib/studentDataAggregator"
import { buildAnalysisPrompt } from "@/lib/promptTemplate"

export class AnalysisApiError extends Error {
  code: string
  statusCode?: number
  constructor(message: string, code: string, statusCode?: number) {
    super(message)
    this.name = "AnalysisApiError"
    this.code = code
    this.statusCode = statusCode
  }
}

export interface AnalysisResult {
  analysis: string
  model: string
  usage: { input_tokens: number; output_tokens: number }
}

export interface UseAnalysisReturn {
  result: AnalysisResult | null
  loading: boolean
  error: AnalysisApiError | null
  analyze: (profile: StudentProfile) => Promise<void>
  retry: () => Promise<void>
  reset: () => void
}

export function useAnalysis(): UseAnalysisReturn {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AnalysisApiError | null>(null)
  const [lastProfile, setLastProfile] = useState<StudentProfile | null>(null)

  const analyze = useCallback(async (profile: StudentProfile) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setLastProfile(profile)

    const prompt = buildAnalysisPrompt(profile)

    let lastErr: AnalysisApiError | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, studentProfile: profile }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "Unknown error", code: "UNKNOWN" }))
          throw new AnalysisApiError(body.error, body.code, res.status)
        }
        const data: AnalysisResult = await res.json()
        setResult(data)
        setLoading(false)
        return
      } catch (err) {
        if (err instanceof AnalysisApiError) {
          // Don't retry client errors (4xx)
          if (err.statusCode && err.statusCode < 500) {
            setError(err)
            setLoading(false)
            return
          }
          lastErr = err
        } else {
          lastErr = new AnalysisApiError(
            err instanceof Error ? err.message : "Network error",
            "NETWORK_ERROR"
          )
        }
        // Exponential backoff before retry
        if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
      }
    }
    setError(lastErr)
    setLoading(false)
  }, [])

  const retry = useCallback(async () => {
    if (lastProfile) await analyze(lastProfile)
  }, [lastProfile, analyze])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  return { result, loading, error, analyze, retry, reset }
}

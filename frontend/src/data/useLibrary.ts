import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/data/useAuth"

export interface SavedAnalysis {
  id: string
  student_name: string
  student_id: string
  grade_level: string
  analysis_text: string
  saved_at: string
}

interface UseLibraryReturn {
  analyses: SavedAnalysis[]
  loading: boolean
  saving: boolean
  saveAnalysis: (data: Omit<SavedAnalysis, "id" | "saved_at">) => Promise<void>
  deleteAnalysis: (id: string) => Promise<void>
}

export function useLibrary(): UseLibraryReturn {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchAnalyses = useCallback(async () => {
    if (!user) {
      setAnalyses([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("saved_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false })

    if (error) {
      console.error("Error fetching analyses:", error.message)
    } else {
      setAnalyses(data as SavedAnalysis[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchAnalyses()
  }, [fetchAnalyses])

  const saveAnalysis = useCallback(
    async (data: Omit<SavedAnalysis, "id" | "saved_at">) => {
      if (!user) throw new Error("Must be signed in to save analyses")
      setSaving(true)
      try {
        const { error } = await supabase.from("saved_analyses").insert({
          user_id: user.id,
          student_name: data.student_name,
          student_id: data.student_id,
          grade_level: data.grade_level,
          analysis_text: data.analysis_text,
        })
        if (error) throw error
        await fetchAnalyses()
      } finally {
        setSaving(false)
      }
    },
    [user, fetchAnalyses]
  )

  const deleteAnalysis = useCallback(
    async (id: string) => {
      if (!user) return
      const { error } = await supabase
        .from("saved_analyses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
      if (error) {
        console.error("Error deleting analysis:", error.message)
      } else {
        setAnalyses(prev => prev.filter(a => a.id !== id))
      }
    },
    [user]
  )

  return { analyses, loading, saving, saveAnalysis, deleteAnalysis }
}

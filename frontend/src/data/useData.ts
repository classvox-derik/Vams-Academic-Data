import { createContext, useContext, useEffect, useState } from "react"

export interface SheetData {
  headers: string[]
  rows: Record<string, string>[]
}

export type DataStore = Record<string, SheetData>

interface DataContextValue {
  data: DataStore
  loading: boolean
}

export const DataContext = createContext<DataContextValue>({ data: {}, loading: true })

export function useData() {
  return useContext(DataContext)
}

export function useDataLoader() {
  const [data, setData] = useState<DataStore>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/data.json")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  return { data, loading }
}

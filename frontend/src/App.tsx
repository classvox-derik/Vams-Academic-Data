import { BrowserRouter, Routes, Route } from "react-router-dom"
import { DataContext, useDataLoader } from "@/data/useData"
import { Layout } from "@/components/Layout"
import { Dashboard } from "@/pages/Dashboard"
import { Students } from "@/pages/Students"
import { GradeView } from "@/pages/GradeView"
import { IReady } from "@/pages/IReady"
import { CAASPP } from "@/pages/CAASPP"
import { IAB } from "@/pages/IAB"
import { CAST } from "@/pages/CAST"
import { GPAs } from "@/pages/GPAs"
import { Interventions } from "@/pages/Interventions"
import { StudentAnalysis } from "@/pages/StudentAnalysis"

function App() {
  const { data, loading } = useDataLoader()

  return (
    <DataContext.Provider value={{ data, loading }}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:studentId/analysis" element={<StudentAnalysis />} />
            <Route path="grade/:grade" element={<GradeView />} />
            <Route path="iready" element={<IReady />} />
            <Route path="caaspp" element={<CAASPP />} />
            <Route path="iab" element={<IAB />} />
            <Route path="cast" element={<CAST />} />
            <Route path="gpas" element={<GPAs />} />
            <Route path="interventions" element={<Interventions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataContext.Provider>
  )
}

export default App

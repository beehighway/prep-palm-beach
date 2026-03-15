import { HashRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useStudyStore } from './store/useStudyStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PatternGrid from './pages/PatternGrid'
import Metrics from './pages/Metrics'
import DayDetail from './pages/DayDetail'
import Settings from './pages/Settings'

function App() {
  const fetchLogs = useStudyStore(s => s.fetchLogs)

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/grid" element={<PatternGrid />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/day/:dayNumber" element={<DayDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App

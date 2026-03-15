import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useStudyStore } from './store/useStudyStore'
import { useAuthStore } from './store/useAuthStore'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PatternGrid from './pages/PatternGrid'
import Metrics from './pages/Metrics'
import DayDetail from './pages/DayDetail'
import Settings from './pages/Settings'
import Auth from './pages/Auth'

function App() {
  const fetchLogs = useStudyStore(s => s.fetchLogs)
  const clearLogs = useStudyStore(s => s.clearLogs)
  const { session, loading, setSession } = useAuthStore()

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'SIGNED_OUT') {
        clearLogs()
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, clearLogs])

  useEffect(() => {
    if (session) {
      fetchLogs()
    }
  }, [session, fetchLogs])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
        
        <Route element={session ? <Layout /> : <Navigate to="/auth" />}>
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

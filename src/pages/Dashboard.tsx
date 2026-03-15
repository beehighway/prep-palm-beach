import { useStudyStore } from '../store/useStudyStore'
import { Link } from 'react-router-dom'
import plan from '../data/plan.json'
import type { StudyDay } from '../types'
import { BookOpen, Code, Brain, FileText, ChevronRight, AlertCircle, Flame } from 'lucide-react'
import { useMemo } from 'react'

const typedPlan = plan as StudyDay[]

const taskTypeColors: Record<string, string> = {
  DSA: 'bg-dsa/15 text-dsa border-dsa/30',
  'System Design': 'bg-sysdesign/15 text-sysdesign border-sysdesign/30',
  Buffer: 'bg-buffer/15 text-buffer border-buffer/30',
  Gauntlet: 'bg-gauntlet/15 text-gauntlet border-gauntlet/30',
  Recall: 'bg-recall/15 text-recall border-recall/30',
}

export default function Dashboard() {
  const currentDay = useStudyStore(s => s.currentDay)
  const logs = useStudyStore(s => s.logs)
  const loading = useStudyStore(s => s.loading)

  const srsDue = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return logs
      .filter(l => l.next_srs_review && l.next_srs_review.slice(0, 10) <= today && l.status === 'Completed')
      .sort((a, b) => (a.next_srs_review || '').localeCompare(b.next_srs_review || ''))
      .slice(0, 2)
  }, [logs])

  const completedCount = useMemo(() => logs.filter(l => l.status === 'Completed').length, [logs])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const todayPlan = typedPlan.find(d => d.day === currentDay)
  const weekCompleted = logs.filter(l => {
    if (l.status !== 'Completed' || !l.completed_date) return false
    const d = new Date(l.completed_date)
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)
    return d >= startOfWeek
  }).length

  // Upcoming days
  const upcoming = typedPlan
    .filter(d => d.day > currentDay && d.day <= currentDay + 5)

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Command Center
          </h1>
          <p className="text-text-secondary mt-2 text-lg">Day {currentDay} of 150 · {todayPlan?.phase}</p>
        </div>
        <div className="flex items-center gap-3 text-text-secondary bg-bg-card px-5 py-2.5 rounded-2xl border border-border">
          <Flame className="w-5 h-5 text-gauntlet" />
          <span className="text-sm font-semibold">{weekCompleted}/4 sessions this week</span>
        </div>
      </div>

      {/* SRS Alert Banner */}
      {srsDue.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 p-6 shadow-lg shadow-accent/5">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-accent-glow" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-accent-glow mb-2">SRS Warm-Up Required</h3>
              {srsDue.map(s => (
                <p key={s.day_number} className="text-sm text-text-secondary mb-1">
                  Re-type <span className="text-text-primary font-semibold">{s.primary_topic}</span> from scratch (15 mins)
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Due Today Card */}
      {todayPlan && (
        <Link
          to={`/day/${currentDay}`}
          className="block group"
        >
          <div className="relative overflow-hidden rounded-3xl bg-bg-card border border-border hover:border-accent/40 transition-all duration-300 p-10 shadow-xl shadow-bg-primary/50">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${taskTypeColors[todayPlan.taskType] || 'bg-bg-secondary text-text-secondary border-border'}`}>
                    {todayPlan.taskType}
                  </span>
                  <span className="text-sm font-medium text-text-muted">Day {currentDay}</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{todayPlan.title}</h2>
                {todayPlan.topics.length > 0 && (
                  <p className="text-base text-text-secondary font-medium">
                    {todayPlan.topics.join(' · ')}
                  </p>
                )}
                {/* Blueprint Breakdown */}
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex items-center gap-2.5 text-text-muted text-sm font-medium">
                    <Brain className="w-4 h-4 text-text-secondary" /> 15m Recall
                  </div>
                  <div className="flex items-center gap-2.5 text-text-muted text-sm font-medium">
                    <BookOpen className="w-4 h-4 text-text-secondary" /> 30m Learn
                  </div>
                  <div className="flex items-center gap-2.5 text-text-muted text-sm font-medium">
                    <Code className="w-4 h-4 text-text-secondary" /> 60m Implement
                  </div>
                  <div className="flex items-center gap-2.5 text-text-muted text-sm font-medium">
                    <FileText className="w-4 h-4 text-text-secondary" /> 15m Doc
                  </div>
                </div>
              </div>
              <ChevronRight className="w-8 h-8 mt-2 text-text-muted group-hover:text-accent transition-colors" />
            </div>
          </div>
        </Link>
      )}

      {/* Global Progress */}
      <div className="rounded-3xl bg-bg-card border border-border p-8">
        <div className="flex justify-between items-end mb-5">
          <h3 className="text-lg font-bold text-text-secondary">Overall Progress</h3>
          <span className="text-xl font-black text-accent">{completedCount} <span className="text-base font-semibold text-text-muted">/ 150</span></span>
        </div>
        <div className="h-4 bg-bg-primary rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-glow rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(completedCount / 150) * 100}%` }}
          />
        </div>
        <p className="text-sm font-medium text-text-muted mt-3">
          {Math.round((completedCount / 150) * 100)}% complete towards mastery
        </p>
      </div>

      {/* Upcoming Schedule */}
      <div className="pt-4">
        <h3 className="text-lg font-bold text-text-secondary mb-6 pl-2">Coming Up Next</h3>
        <div className="space-y-3">
          {upcoming.map(day => (
            <Link
              key={day.day}
              to={`/day/${day.day}`}
              className="flex items-center justify-between p-5 rounded-2xl bg-bg-card border border-border hover:border-border-focus/50 hover:bg-bg-card-hover transition-all group shadow-sm"
            >
              <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-text-muted w-14 font-mono">Day {String(day.day).padStart(3, '0')}</span>
                <span className={`px-3 py-1 rounded-md text-xs font-bold border ${taskTypeColors[day.taskType] || 'bg-bg-secondary text-text-secondary border-border'}`}>
                  {day.taskType}
                </span>
                <span className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors">{day.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

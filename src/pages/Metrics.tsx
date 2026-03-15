import { useStudyStore } from '../store/useStudyStore'
import plan from '../data/plan.json'
import type { StudyDay } from '../types'
import { Target, Cpu, Swords, BarChart3 } from 'lucide-react'
import { useMemo } from 'react'

const typedPlan = plan as StudyDay[]

export default function Metrics() {
  const logs = useStudyStore(s => s.logs)
  const completedCount = useMemo(() => logs.filter(l => l.status === 'Completed').length, [logs])

  const dsaCompleted = useMemo(() => logs.filter(l => l.status === 'Completed' && l.task_type === 'DSA').length, [logs])
  const sdCompleted = useMemo(() => logs.filter(l => l.status === 'Completed' && l.task_type === 'System Design').length, [logs])
  const gauntletCompleted = useMemo(() => logs.filter(l => l.status === 'Completed' && l.task_type === 'Gauntlet').length, [logs])

  // Pattern stats
  const completedPatternIds = new Set<number>()
  typedPlan.forEach(day => {
    const log = logs.find(l => l.day_number === day.day)
    if (log?.status === 'Completed' && day.patternIds) {
      day.patternIds.forEach(pid => completedPatternIds.add(pid))
    }
  })

  // Phase progress
  const phases = [
    { name: 'Phase 0', label: 'Foundations', range: [1, 14] },
    { name: 'Phase 1', label: 'Pointers & Windows', range: [15, 30] },
    { name: 'Phase 2', label: 'Stacks, Lists & Async', range: [31, 60] },
    { name: 'Phase 3', label: 'DP, Heaps & Scalability', range: [61, 100] },
    { name: 'Phase 4', label: 'Advanced Toolkit', range: [101, 130] },
    { name: 'Phase 5', label: 'Final Polish', range: [131, 150] },
  ]

  return (
    <div className="space-y-12 pb-16">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Metrics</h1>
        <p className="text-text-secondary mt-2 text-lg">Track your preparation progress</p>
      </div>

      {/* Global Progress */}
      <div className="rounded-3xl bg-bg-card border border-border p-8 shadow-sm">
        <div className="flex justify-between items-end mb-5">
          <h3 className="text-xl font-bold">Overall Progress</h3>
          <span className="text-3xl font-black text-accent">{Math.round((completedCount / 150) * 100)}%</span>
        </div>
        <div className="h-5 bg-bg-primary rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-glow rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(completedCount / 150) * 100}%` }}
          />
        </div>
        <p className="text-sm font-semibold text-text-muted mt-3">{completedCount} of 150 days completed</p>
      </div>

      {/* Category Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Target, label: 'DSA Patterns Conquered', value: completedPatternIds.size, max: 99, color: 'text-dsa' },
          { icon: Cpu, label: 'System Designs Diagrammed', value: sdCompleted, max: typedPlan.filter(d => d.taskType === 'System Design').length, color: 'text-sysdesign' },
          { icon: Swords, label: 'Mock Interviews Survived', value: gauntletCompleted, max: typedPlan.filter(d => d.taskType === 'Gauntlet').length, color: 'text-gauntlet' },
          { icon: BarChart3, label: 'DSA Days Done', value: dsaCompleted, max: typedPlan.filter(d => d.taskType === 'DSA').length, color: 'text-recall' },
        ].map(stat => (
          <div key={stat.label} className="rounded-3xl bg-bg-card border border-border p-6 shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <stat.icon className={`w-6 h-6 ${stat.color} mb-4`} />
            <div className="text-4xl font-black tracking-tight">{stat.value}</div>
            <div className="text-sm font-semibold text-text-muted mt-2">{stat.label}</div>
            <div className="h-2 bg-bg-primary rounded-full overflow-hidden mt-4 border border-border/50">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-glow rounded-full transition-all duration-700"
                style={{ width: `${stat.max > 0 ? (stat.value / stat.max) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Phase Breakdown */}
      <div className="pt-4">
        <h3 className="text-2xl font-bold mb-6">Phase Progress</h3>
        <div className="space-y-4">
          {phases.map(phase => {
            const total = phase.range[1] - phase.range[0] + 1
            const completed = logs.filter(
              l => l.day_number >= phase.range[0] && l.day_number <= phase.range[1] && l.status === 'Completed'
            ).length
            const pct = Math.round((completed / total) * 100)

            return (
              <div key={phase.name} className="rounded-2xl bg-bg-card border border-border p-6 shadow-sm">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="text-base font-bold text-text-primary mr-2">{phase.name}:</span>
                    <span className="text-base font-medium text-text-secondary">{phase.label}</span>
                  </div>
                  <span className="text-sm font-bold text-text-muted">{completed}/{total} ({pct}%)</span>
                </div>
                <div className="h-3 bg-bg-primary rounded-full overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent-glow rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

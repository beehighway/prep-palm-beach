import { useParams, Link } from 'react-router-dom'
import { useStudyStore } from '../store/useStudyStore'
import plan from '../data/plan.json'
import type { StudyDay } from '../types'
import { ArrowLeft, Brain, BookOpen, Code, FileText, Check, ExternalLink, AlertTriangle, RotateCcw } from 'lucide-react'

const typedPlan = plan as StudyDay[]

const taskTypeColors: Record<string, string> = {
  DSA: 'bg-dsa/15 text-dsa border-dsa/30',
  'System Design': 'bg-sysdesign/15 text-sysdesign border-sysdesign/30',
  Buffer: 'bg-buffer/15 text-buffer border-buffer/30',
  Gauntlet: 'bg-gauntlet/15 text-gauntlet border-gauntlet/30',
  Recall: 'bg-recall/15 text-recall border-recall/30',
}

const difficultyColors: Record<string, string> = {
  Easy: 'text-success',
  Medium: 'text-warning',
  Hard: 'text-danger',
}

export default function DayDetail() {
  const { dayNumber } = useParams()
  const dayNum = Number(dayNumber)
  const dayPlan = typedPlan.find(d => d.day === dayNum)
  const log = useStudyStore(s => s.getLogForDay(dayNum))
  const { updateChecklist, markDayComplete, carryOver, undoComplete } = useStudyStore()

  if (!dayPlan) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">Day not found</p>
        <Link to="/" className="text-accent text-sm mt-2 inline-block">Back to Dashboard</Link>
      </div>
    )
  }

  const checklist = [
    { key: 'checklist_recall' as const, label: '15m Active Recall', hint: 'What was yesterday\'s pattern?', icon: Brain, checked: log?.checklist_recall || false },
    { key: 'checklist_learn' as const, label: '30m Deep Learning', hint: 'Study theory and trade-offs', icon: BookOpen, checked: log?.checklist_learn || false },
    { key: 'checklist_implement' as const, label: '60m Implementation', hint: 'Code from scratch', icon: Code, checked: log?.checklist_implement || false },
    { key: 'checklist_doc' as const, label: '15m Documentation', hint: 'Log bottlenecks & edge cases', icon: FileText, checked: log?.checklist_doc || false },
  ]

  const allChecked = checklist.every(c => c.checked)
  const isComplete = log?.status === 'Completed'
  const isCarryOver = log?.status === 'Carry Over'

  return (
    <div className="space-y-10 pb-32">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Link to="/" className="w-12 h-12 rounded-2xl bg-bg-card border border-border flex items-center justify-center text-text-muted hover:text-white hover:border-text-muted transition-all duration-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${taskTypeColors[dayPlan.taskType] || 'bg-bg-secondary text-text-secondary border-border'}`}>
              {dayPlan.taskType}
            </span>
            <span className="text-sm font-semibold text-text-muted">Day {dayNum}</span>
            {isComplete && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/15 text-success border border-success/30">
                ✓ Complete
              </span>
            )}
            {isCarryOver && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning/15 text-warning border border-warning/30">
                Carried Over
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{dayPlan.title}</h1>
        </div>
      </div>

      {/* Warmup */}
      {dayPlan.warmup && (
        <div className="rounded-3xl bg-accent/5 border border-accent/20 p-6 shadow-sm shadow-accent/5">
          <p className="text-sm text-accent-glow font-bold mb-2">15-Minute Warm-Up</p>
          <p className="text-base text-text-primary">Re-type <span className="font-bold text-white">{dayPlan.warmup}</span> from scratch</p>
        </div>
      )}

      {/* Blueprint Checklist */}
      <div className="rounded-3xl bg-bg-card border border-border p-8 space-y-6 shadow-sm">
        <h3 className="text-lg font-bold text-text-secondary">Blueprint Execution</h3>
        <div className="space-y-4">
          {checklist.map(item => (
            <button
              key={item.key}
              onClick={() => updateChecklist(dayNum, item.key, !item.checked)}
              disabled={isComplete}
              className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300 ${
                item.checked
                  ? 'bg-success/5 border-success/30'
                  : 'bg-bg-primary border-border hover:border-border-focus/50 hover:bg-bg-card-hover'
              } ${isComplete ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                item.checked ? 'bg-success border-success' : 'border-text-muted bg-bg-secondary'
              }`}>
                {item.checked && <Check className="w-4 h-4 text-bg-primary" />}
              </div>
              <item.icon className={`w-5 h-5 ${item.checked ? 'text-success' : 'text-text-muted'}`} />
              <div className="text-left">
                <p className={`text-base font-bold ${item.checked ? 'text-success line-through opacity-80' : 'text-text-primary'}`}>
                  {item.label}
                </p>
                <p className="text-sm text-text-muted mt-0.5 font-medium">{item.hint}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Problem List */}
      {dayPlan.problems.length > 0 && (
        <div className="rounded-3xl bg-bg-card border border-border p-8 space-y-6 shadow-sm">
          <h3 className="text-lg font-bold text-text-secondary">Problem Execution List</h3>
          <div className="space-y-4">
            {dayPlan.problems.map(prob => (
              <div key={prob.lc} className="flex items-center justify-between p-5 rounded-2xl bg-bg-primary border border-border">
                <div className="flex items-center gap-5">
                  <span className={`text-sm font-bold w-16 ${difficultyColors[prob.difficulty]}`}>
                    {prob.difficulty}
                  </span>
                  <span className="text-base font-semibold text-text-primary">{prob.name}</span>
                </div>
                <a
                  href={`https://leetcode.com/problems/${prob.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary text-sm font-semibold text-accent hover:text-accent-glow hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-all"
                >
                  LC {prob.lc} <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      {dayPlan.topics.length > 0 && (
        <div className="rounded-3xl bg-bg-card border border-border p-8 shadow-sm">
          <h3 className="text-lg font-bold text-text-secondary mb-5">Topics Covered</h3>
          <div className="flex flex-wrap gap-3">
            {dayPlan.topics.map(topic => (
              <span key={topic} className="px-4 py-2 rounded-xl bg-bg-primary border border-border text-sm font-semibold text-text-secondary">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div 
        className="bg-bg-secondary/80 backdrop-blur-xl border-t border-border z-40"
        style={{ position: 'fixed', bottom: 0, left: '72px', right: 0 }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2.5rem' }}>
          <div className="flex items-center gap-3">
            {!isComplete && (
              <button
                onClick={() => carryOver(dayNum)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning/10 text-warning border border-warning/30 text-sm font-medium hover:bg-warning/20 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Carry Over / Blocked
              </button>
            )}
            {isComplete && (
              <button
                onClick={() => undoComplete(dayNum)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-text-muted text-sm hover:text-text-secondary transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Undo
              </button>
            )}
          </div>
          {!isComplete && (
            <button
              onClick={() => markDayComplete(dayNum)}
              disabled={!allChecked}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                allChecked
                  ? 'bg-success text-bg-primary hover:bg-success-dim shadow-[0_0_20px_rgba(0,230,118,0.2)]'
                  : 'bg-bg-card text-text-muted border border-border cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              Mark Day Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

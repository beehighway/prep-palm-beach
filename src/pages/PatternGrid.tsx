
import catalog from '../data/catalog.json'
import plan from '../data/plan.json'
import type { StudyDay, Catalog } from '../types'
import { useStudyStore } from '../store/useStudyStore'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, AlertCircle, ChevronDown, ExternalLink } from 'lucide-react'
import { useState } from 'react'

const typedCatalog = catalog as Catalog
const typedPlan = plan as StudyDay[]

export default function PatternGrid() {
  const logs = useStudyStore(s => s.logs)
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set([typedCatalog.topics[0]?.id]))

  const toggleTopic = (id: number) => {
    const next = new Set(expandedTopics)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setExpandedTopics(next)
  }

  // Map patternId -> status
  const patternStatusMap = new Map<number, 'Completed' | 'Needs Review' | 'Not Started'>()

  typedPlan.forEach(day => {
    if (!day.patternIds) return
    const log = logs.find(l => l.day_number === day.day)
    if (log?.status === 'Completed') {
      day.patternIds.forEach(pid => {
        if (!patternStatusMap.has(pid)) patternStatusMap.set(pid, 'Completed')
      })
    } else if (log?.status === 'Needs Review') {
      day.patternIds.forEach(pid => {
        patternStatusMap.set(pid, 'Needs Review')
      })
    }
  })

  return (
    <div className="space-y-8 pb-32 max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Pattern Data Sheet</h1>
          <p className="text-text-secondary mt-2 text-lg">
            Master the core 99 patterns required to conquer any DSA interview.
          </p>
        </div>
        
        <div className="flex items-center gap-6 bg-bg-card px-6 py-3 rounded-2xl border border-border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-bold text-white">{patternStatusMap.size}</span>
            <span className="text-sm font-medium text-text-muted">Mastered</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <Circle className="w-5 h-5 text-border" />
            <span className="text-sm font-bold text-white">{99 - patternStatusMap.size}</span>
            <span className="text-sm font-medium text-text-muted">Remaining</span>
          </div>
        </div>
      </div>

      <div className="mb-8 px-5 py-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-start flex-col gap-1">
        <div className="flex items-center gap-2 text-accent-glow font-bold text-sm">
          <span>💡 Note on Study Days:</span>
        </div>
        <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
          Days 1-7 focus on foundational concepts (Standard Sorting, System Design Basics) and are not part of the 99 Patterns list.
          Additionally, some study days are rigorous and cover multiple patterns simultaneously, which means you'll see the same day listed multiple times across different patterns.
        </p>
      </div>

      <div className="bg-bg-card border border-border rounded-3xl overflow-hidden shadow-xl shadow-bg-primary/50">
        
        {/* Table Header */}
        <div className="grid grid-cols-[3rem_1fr_8rem_10rem_1fr] gap-4 px-8 py-4 bg-bg-secondary/50 border-b border-border/50 text-xs font-bold text-text-muted uppercase tracking-wider">
          <div>ID</div>
          <div>Pattern / Topic</div>
          <div className="text-center">Status</div>
          <div className="text-center">Study Day</div>
          <div className="text-right">Action</div>
        </div>

        {/* Data Sheet Content */}
        <div className="divide-y divide-border/30">
          {typedCatalog.topics.map((topic, topicIdx) => {
            const isExpanded = expandedTopics.has(topic.id)
            const topicPatterns = topic.patterns
            const completedInTopic = topicPatterns.filter(p => patternStatusMap.get(p.patternId) === 'Completed').length
            
            return (
              <div key={topic.id} className="group">
                {/* Topic Row (Accordion Header) */}
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="w-full grid grid-cols-[3rem_1fr_8rem_10rem_1fr] gap-4 px-8 py-5 items-center hover:bg-bg-secondary/30 transition-colors text-left"
                >
                  <div className="text-sm font-mono font-bold text-text-muted">
                    {String(topicIdx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex items-center gap-4">
                    <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    <h3 className="text-lg font-bold text-white">{topic.name}</h3>
                  </div>
                  
                  {/* Topic Progress */}
                  <div className="col-start-3 col-span-3 lg:col-start-auto lg:col-span-1 flex items-center justify-end lg:justify-center gap-3">
                    <div className="w-24 h-2 bg-bg-primary rounded-full overflow-hidden border border-border/50">
                      <div 
                        className="h-full bg-accent transition-all duration-500"
                        style={{ width: `${(completedInTopic / topicPatterns.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-text-muted w-10 text-right">
                      {completedInTopic}/{topicPatterns.length}
                    </span>
                  </div>
                </button>

                {/* Pattern Rows (Accordion Content) */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out bg-bg-primary/20 ${
                    isExpanded ? 'max-h-[2000px] opacity-100 border-t border-border/30' : 'max-h-0 opacity-0'
                  }`}
                >
                  {topic.patterns.map(pattern => {
                    const status = patternStatusMap.get(pattern.patternId) || 'Not Started'
                    const dayForPattern = typedPlan.find(d => d.patternIds?.includes(pattern.patternId))
                    const isCompleted = status === 'Completed'

                    return (
                      <div 
                        key={pattern.patternId}
                        className="grid grid-cols-[3rem_1fr_8rem_10rem_1fr] gap-4 px-8 py-4 items-center border-b border-border/20 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Pattern ID */}
                        <div className="text-xs font-mono font-bold text-text-muted/50 pl-2">
                          {String(pattern.patternId).padStart(3, '0')}
                        </div>

                        {/* Pattern Name */}
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          ) : status === 'Needs Review' ? (
                            <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-border flex-shrink-0" />
                          )}
                          <span className={`text-sm font-semibold transition-colors ${
                            isCompleted ? 'text-white' : 'text-text-secondary'
                          }`}>
                            {pattern.name}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex justify-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isCompleted 
                              ? 'bg-success/10 text-success border-success/20' 
                              : status === 'Needs Review'
                              ? 'bg-warning/10 text-warning border-warning/20'
                              : 'bg-bg-secondary text-text-muted border-border'
                          }`}>
                            {status}
                          </span>
                        </div>

                        {/* Day Link */}
                        <div className="flex justify-center">
                          {dayForPattern ? (
                            <Link 
                              to={`/day/${dayForPattern.day}`}
                              className="text-xs font-semibold text-text-muted hover:text-accent transition-colors"
                            >
                              Day {dayForPattern.day}
                            </Link>
                          ) : (
                            <span className="text-xs text-border">-</span>
                          )}
                        </div>

                        {/* Action */}
                        <div className="flex justify-end pr-2">
                          {dayForPattern ? (
                            <Link 
                              to={`/day/${dayForPattern.day}`}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isCompleted 
                                  ? 'text-text-muted hover:text-white bg-bg-secondary hover:bg-white/10'
                                  : 'text-accent bg-accent/10 hover:bg-accent/20'
                              }`}
                            >
                              {isCompleted ? 'Review' : 'Start'}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span className="text-xs text-border">-</span>
                          )}
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

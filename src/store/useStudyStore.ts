import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { StudyLogEntry, StudyDay } from '../types'
import { addDays, format } from 'date-fns'
import plan from '../data/plan.json'

const typedPlan = plan as StudyDay[]

interface StudyStore {
  logs: StudyLogEntry[]
  loading: boolean
  currentDay: number

  fetchLogs: () => Promise<void>
  clearLogs: () => void
  updateChecklist: (dayNumber: number, field: 'checklist_recall' | 'checklist_learn' | 'checklist_implement' | 'checklist_doc', value: boolean) => Promise<void>
  markDayComplete: (dayNumber: number) => Promise<void>
  carryOver: (dayNumber: number) => Promise<void>
  undoComplete: (dayNumber: number) => Promise<void>
  getLogForDay: (dayNumber: number) => StudyLogEntry | undefined
  getSrsDueToday: () => StudyLogEntry[]
  getCompletedCount: () => number
  getPatternStatus: (patternIds: number[]) => 'Not Started' | 'Completed' | 'Needs Review'
}

export const useStudyStore = create<StudyStore>((set, get) => ({
  logs: [],
  loading: true,
  currentDay: 1,

  fetchLogs: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    set({ loading: true })
    const { data, error } = await supabase
      .from('study_log')
      .select('*')
      .order('day_number', { ascending: true })

    if (error) {
      console.error('Error fetching logs:', error)
      set({ loading: false })
      return
    }

    let logs = (data || []) as StudyLogEntry[]

    // Auto-seed if first time for this user
    if (logs.length === 0) {
      console.log('Seeding logs for user:', user.id)
      const seedData = typedPlan.map(day => ({
        user_id: user.id,
        day_number: day.day,
        phase: day.phase,
        task_type: day.taskType,
        primary_topic: day.title,
        status: 'Not Started',
        completed_date: null,
        next_srs_review: null,
        checklist_recall: false,
        checklist_learn: false,
        checklist_implement: false,
        checklist_doc: false
      }))

      const { data: inserted, error: seedError } = await supabase
        .from('study_log')
        .insert(seedData)
        .select()

      if (seedError) {
        console.error('Error seeding logs:', seedError)
      } else {
        logs = (inserted || []) as StudyLogEntry[]
      }
    }

    // Calculate current day: first incomplete day
    let currentDay = 1
    for (let i = 1; i <= 150; i++) {
      const log = logs.find(l => l.day_number === i)
      if (!log || log.status !== 'Completed') {
        currentDay = i
        break
      }
      if (i === 150) currentDay = 150
    }

    set({ logs, loading: false, currentDay })
  },

  clearLogs: () => set({ logs: [], currentDay: 1, loading: true }),

  updateChecklist: async (dayNumber, field, value) => {
    const existing = get().logs.find(l => l.day_number === dayNumber)
    
    if (existing) {
      // Optimistic update
      set(state => ({
        logs: state.logs.map(l =>
          l.day_number === dayNumber ? { ...l, [field]: value } : l
        )
      }))

      if (existing.id) {
        await supabase
          .from('study_log')
          .update({ [field]: value })
          .eq('id', existing.id)
      }
    } else {
      // Create new log from plan
      const dayPlan = typedPlan.find(d => d.day === dayNumber)
      if (!dayPlan) return

      const newLog: StudyLogEntry = {
        day_number: dayNumber,
        phase: dayPlan.phase,
        task_type: dayPlan.taskType,
        primary_topic: dayPlan.title,
        status: 'Not Started',
        completed_date: null,
        next_srs_review: null,
        checklist_recall: false,
        checklist_learn: false,
        checklist_implement: false,
        checklist_doc: false,
        [field]: value
      }

      // Optimistic addition
      set(state => ({ logs: [...state.logs, newLog] }))

      const { data } = await supabase
        .from('study_log')
        .insert(newLog)
        .select()
        .single()
        
      if (data) {
        set(state => ({
          logs: state.logs.map(l => l.day_number === dayNumber ? (data as StudyLogEntry) : l)
        }))
      }
    }
  },

  markDayComplete: async (dayNumber) => {
    const now = new Date()
    const completedDate = format(now, "yyyy-MM-dd'T'HH:mm:ssXXX")
    const nextSrs = format(addDays(now, 14), "yyyy-MM-dd'T'HH:mm:ssXXX")

    // Optimistic update
    set(state => {
      const updatedLogs = state.logs.map(l =>
        l.day_number === dayNumber
          ? {
              ...l,
              status: 'Completed' as const,
              completed_date: completedDate,
              next_srs_review: nextSrs,
              checklist_recall: true,
              checklist_learn: true,
              checklist_implement: true,
              checklist_doc: true,
            }
          : l
      )
      // Recalculate current day
      let newCurrentDay = 1
      for (let i = 1; i <= 150; i++) {
        const log = updatedLogs.find(l => l.day_number === i)
        if (!log || log.status !== 'Completed') {
          newCurrentDay = i
          break
        }
        if (i === 150) newCurrentDay = 150
      }
      return { logs: updatedLogs, currentDay: newCurrentDay }
    })

    const existing = get().logs.find(l => l.day_number === dayNumber)
    if (existing?.id) {
      await supabase
        .from('study_log')
        .update({
          status: 'Completed',
          completed_date: completedDate,
          next_srs_review: nextSrs,
          checklist_recall: true,
          checklist_learn: true,
          checklist_implement: true,
          checklist_doc: true,
        })
        .eq('id', existing.id)
    }
  },

  carryOver: async (dayNumber) => {
    set(state => ({
      logs: state.logs.map(l =>
        l.day_number === dayNumber ? { ...l, status: 'Carry Over' as const } : l
      )
    }))

    const existing = get().logs.find(l => l.day_number === dayNumber)
    if (existing?.id) {
      await supabase
        .from('study_log')
        .update({ status: 'Carry Over' })
        .eq('id', existing.id)
    }
  },

  undoComplete: async (dayNumber) => {
    set(state => ({
      logs: state.logs.map(l =>
        l.day_number === dayNumber
          ? {
              ...l,
              status: 'Not Started' as const,
              completed_date: null,
              next_srs_review: null,
              checklist_recall: false,
              checklist_learn: false,
              checklist_implement: false,
              checklist_doc: false,
            }
          : l
      )
    }))

    const existing = get().logs.find(l => l.day_number === dayNumber)
    if (existing?.id) {
      await supabase
        .from('study_log')
        .update({
          status: 'Not Started',
          completed_date: null,
          next_srs_review: null,
          checklist_recall: false,
          checklist_learn: false,
          checklist_implement: false,
          checklist_doc: false,
        })
        .eq('id', existing.id)
    }
  },

  getLogForDay: (dayNumber) => {
    return get().logs.find(l => l.day_number === dayNumber)
  },

  getSrsDueToday: () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return get()
      .logs.filter(l => l.next_srs_review && l.next_srs_review.slice(0, 10) <= today && l.status === 'Completed')
      .sort((a, b) => (a.next_srs_review || '').localeCompare(b.next_srs_review || ''))
      .slice(0, 2)
  },

  getCompletedCount: () => {
    return get().logs.filter(l => l.status === 'Completed').length
  },

  getPatternStatus: (_patternIds) => {
    return 'Not Started'
  },
}))

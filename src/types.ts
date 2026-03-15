export interface StudyDay {
  day: number
  phase: string
  taskType: string
  title: string
  topics: string[]
  problems: Problem[]
  warmup: string | null
  patternIds?: number[]
}

export interface Problem {
  name: string
  lc: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export interface StudyLogEntry {
  id?: number
  day_number: number
  phase: string
  task_type: string
  primary_topic: string
  status: 'Not Started' | 'Completed' | 'Needs Review' | 'Carry Over'
  completed_date: string | null
  next_srs_review: string | null
  checklist_recall: boolean
  checklist_learn: boolean
  checklist_implement: boolean
  checklist_doc: boolean
}

export interface PatternInfo {
  patternId: number
  name: string
}

export interface Topic {
  id: number
  name: string
  patterns: PatternInfo[]
}

export interface Catalog {
  topics: Topic[]
  systemDesignTopics: { id: number; name: string }[]
}

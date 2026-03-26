export type Priority = 'urgent' | 'high' | 'normal' | 'low'

export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: TaskStatus
  estimatedMinutes: number
  elapsedSeconds: number
  createdAt: string
  completedAt: string | null
  focusedAt: string | null
  scheduledDate: string | null
  startTime: string | null
  endTime: string | null
  goalId: string | null
  subtasks: Subtask[]
  order: number
  synced: boolean
}

export interface Goal {
  id: string
  title: string
  description: string
  color: string
  targetDate: string | null
  createdAt: string
  completedAt: string | null
}

export interface ParkedThought {
  id: string
  text: string
  createdAt: string
}

export interface Settings {
  nagIntervalMinutes: number
  soundEnabled: boolean
  notificationsEnabled: boolean
  nagStyle: 'gentle' | 'firm' | 'aggressive'
  supabaseUrl: string
  supabaseKey: string
  syncEnabled: boolean
  darkMode: boolean
  showCompletedTasks: boolean
  pomodoroEnabled: boolean
  workMinutes: number
  breakMinutes: number
}

export interface DailyStats {
  date: string
  tasksCompleted: number
  totalFocusMinutes: number
  longestStreak: number
}

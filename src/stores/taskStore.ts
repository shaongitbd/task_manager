import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Task, Goal, Settings, Priority, ParkedThought } from '../types/task'
import { format } from 'date-fns'

const priorityWeight: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 }

interface TaskState {
  tasks: Task[]
  goals: Goal[]
  parkedThoughts: ParkedThought[]
  focusedTaskId: string | null
  settings: Settings
  nagDismissedAt: number | null
  lastSyncAt: number | null
  view: 'tasks' | 'planner' | 'goals' | 'settings' | 'stats'

  // Transition overlay state
  showTransition: boolean
  lastCompletedTaskTitle: string | null

  // Task actions
  addTask: (title: string, description?: string, priority?: Priority, estimatedMinutes?: number, scheduledDate?: string | null, startTime?: string | null, endTime?: string | null, goalId?: string | null) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  setFocus: (id: string | null) => void
  reorderTask: (id: string, newOrder: number) => void
  tickFocusTimer: () => void
  clearCompleted: () => void
  importTasks: (tasks: Task[]) => void

  // Subtask actions
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void

  // Pick for me — decision fatigue killer
  pickTaskForMe: () => void

  // Parking lot — working memory aid
  parkThought: (text: string) => void
  deleteParkedThought: (id: string) => void
  convertThoughtToTask: (id: string) => void

  // Transition
  dismissTransition: () => void

  // Goal actions
  addGoal: (title: string, description?: string, color?: string, targetDate?: string | null) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  completeGoal: (id: string) => void

  // Settings & UI
  updateSettings: (updates: Partial<Settings>) => void
  dismissNag: () => void
  setView: (view: TaskState['view']) => void
}

const defaultSettings: Settings = {
  nagIntervalMinutes: 3,
  soundEnabled: true,
  notificationsEnabled: true,
  nagStyle: 'firm',
  supabaseUrl: '',
  supabaseKey: '',
  syncEnabled: false,
  darkMode: true,
  showCompletedTasks: false,
  pomodoroEnabled: false,
  workMinutes: 25,
  breakMinutes: 5,
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      goals: [],
      parkedThoughts: [],
      focusedTaskId: null,
      settings: defaultSettings,
      nagDismissedAt: null,
      lastSyncAt: null,
      view: 'tasks',
      showTransition: false,
      lastCompletedTaskTitle: null,

      addTask: (title, description = '', priority = 'normal', estimatedMinutes = 25, scheduledDate = null, startTime = null, endTime = null, goalId = null) => {
        const tasks = get().tasks
        const maxOrder = tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) : -1
        const newTask: Task = {
          id: uuidv4(),
          title,
          description,
          priority,
          status: 'pending',
          estimatedMinutes,
          elapsedSeconds: 0,
          createdAt: new Date().toISOString(),
          completedAt: null,
          focusedAt: null,
          scheduledDate,
          startTime,
          endTime,
          goalId,
          subtasks: [],
          order: maxOrder + 1,
          synced: false,
        }
        set({ tasks: [...tasks, newTask] })
      },

      updateTask: (id, updates) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, ...updates, synced: false } : t
          ),
        })
      },

      deleteTask: (id) => {
        const state = get()
        set({
          tasks: state.tasks.filter((t) => t.id !== id),
          focusedTaskId: state.focusedTaskId === id ? null : state.focusedTaskId,
        })
      },

      completeTask: (id) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === id)
        set({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString(), synced: false }
              : t
          ),
          focusedTaskId: state.focusedTaskId === id ? null : state.focusedTaskId,
          // Trigger transition overlay
          showTransition: state.focusedTaskId === id,
          lastCompletedTaskTitle: task?.title ?? null,
        })
      },

      setFocus: (id) => {
        set({
          focusedTaskId: id,
          nagDismissedAt: Date.now(),
          showTransition: false,
          tasks: get().tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'in_progress' as const, focusedAt: new Date().toISOString(), synced: false }
              : t.status === 'in_progress' && t.id !== id
                ? { ...t, status: 'pending' as const, synced: false }
                : t
          ),
        })
      },

      reorderTask: (id, newOrder) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, order: newOrder, synced: false } : t
          ),
        })
      },

      tickFocusTimer: () => {
        const { focusedTaskId, tasks } = get()
        if (!focusedTaskId) return
        set({
          tasks: tasks.map((t) =>
            t.id === focusedTaskId
              ? { ...t, elapsedSeconds: t.elapsedSeconds + 1 }
              : t
          ),
        })
      },

      clearCompleted: () => {
        set({ tasks: get().tasks.filter((t) => t.status !== 'completed') })
      },

      importTasks: (tasks) => {
        set({ tasks, lastSyncAt: Date.now() })
      },

      // Subtasks
      addSubtask: (taskId, title) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: [...(t.subtasks || []), { id: uuidv4(), title, done: false }], synced: false }
              : t
          ),
        })
      },

      toggleSubtask: (taskId, subtaskId) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: (t.subtasks || []).map((s) =>
                    s.id === subtaskId ? { ...s, done: !s.done } : s
                  ),
                  synced: false,
                }
              : t
          ),
        })
      },

      deleteSubtask: (taskId, subtaskId) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId), synced: false }
              : t
          ),
        })
      },

      // Pick for me — smart task selection
      pickTaskForMe: () => {
        const { tasks } = get()
        const today = format(new Date(), 'yyyy-MM-dd')

        const candidates = tasks
          .filter((t) => t.status !== 'completed')
          .sort((a, b) => {
            // 1. Priority
            const pDiff = priorityWeight[a.priority] - priorityWeight[b.priority]
            if (pDiff !== 0) return pDiff
            // 2. Scheduled today first
            const aToday = a.scheduledDate === today ? 0 : 1
            const bToday = b.scheduledDate === today ? 0 : 1
            if (aToday !== bToday) return aToday - bToday
            // 3. Has goal (external motivation)
            const aGoal = a.goalId ? 0 : 1
            const bGoal = b.goalId ? 0 : 1
            if (aGoal !== bGoal) return aGoal - bGoal
            // 4. Shorter tasks first (low barrier to start)
            return a.estimatedMinutes - b.estimatedMinutes
          })

        if (candidates.length === 0) return

        // Pick randomly from top 3 for novelty/dopamine
        const top = candidates.slice(0, Math.min(3, candidates.length))
        const pick = top[Math.floor(Math.random() * top.length)]
        get().setFocus(pick.id)
      },

      // Parking lot
      parkThought: (text) => {
        set({
          parkedThoughts: [
            ...get().parkedThoughts,
            { id: uuidv4(), text, createdAt: new Date().toISOString() },
          ],
        })
      },

      deleteParkedThought: (id) => {
        set({ parkedThoughts: get().parkedThoughts.filter((p) => p.id !== id) })
      },

      convertThoughtToTask: (id) => {
        const thought = get().parkedThoughts.find((p) => p.id === id)
        if (!thought) return
        get().addTask(thought.text)
        get().deleteParkedThought(id)
      },

      // Transition
      dismissTransition: () => {
        set({ showTransition: false, lastCompletedTaskTitle: null })
      },

      // Goals
      addGoal: (title, description = '', color = '#e8930a', targetDate = null) => {
        set({
          goals: [
            ...get().goals,
            { id: uuidv4(), title, description, color, targetDate, createdAt: new Date().toISOString(), completedAt: null },
          ],
        })
      },

      updateGoal: (id, updates) => {
        set({ goals: get().goals.map((g) => g.id === id ? { ...g, ...updates } : g) })
      },

      deleteGoal: (id) => {
        set({
          goals: get().goals.filter((g) => g.id !== id),
          tasks: get().tasks.map((t) => t.goalId === id ? { ...t, goalId: null, synced: false } : t),
        })
      },

      completeGoal: (id) => {
        set({
          goals: get().goals.map((g) =>
            g.id === id ? { ...g, completedAt: new Date().toISOString() } : g
          ),
        })
      },

      updateSettings: (updates) => {
        set({ settings: { ...get().settings, ...updates } })
      },

      dismissNag: () => set({ nagDismissedAt: Date.now() }),

      setView: (view) => set({ view }),
    }),
    {
      name: 'focusforge-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        goals: state.goals,
        parkedThoughts: state.parkedThoughts,
        focusedTaskId: state.focusedTaskId,
        settings: state.settings,
      }),
    }
  )
)

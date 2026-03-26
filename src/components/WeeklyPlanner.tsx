import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Crosshair,
  Check,
  Trash2,
  Calendar,
  Clock,
  Repeat,
} from 'lucide-react'
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns'
import { useTaskStore } from '@/stores/taskStore'
import type { Priority } from '@/types/task'

const easeOutExpo = [0.16, 1, 0.3, 1] as const

const priorityColors: Record<Priority, string> = {
  urgent: 'bg-heat',
  high: 'bg-ember',
  normal: 'bg-steel',
  low: 'bg-ash',
}

const priorityBorders: Record<Priority, string> = {
  urgent: 'border-l-heat',
  high: 'border-l-ember',
  normal: 'border-l-steel',
  low: 'border-l-ash',
}

// ADHD-friendly shape indicators alongside colors
const priorityShapes: Record<Priority, string> = {
  urgent: '!!',
  high: '!',
  normal: '',
  low: '',
}

export function WeeklyPlanner() {
  const tasks = useTaskStore((s) => s.tasks)
  const goals = useTaskStore((s) => s.goals)
  const addTask = useTaskStore((s) => s.addTask)
  const completeTask = useTaskStore((s) => s.completeTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const setFocus = useTaskStore((s) => s.setFocus)
  const updateTask = useTaskStore((s) => s.updateTask)
  const setView = useTaskStore((s) => s.setView)

  const [weekOffset, setWeekOffset] = useState(0)
  const [addingDay, setAddingDay] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('normal')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')
  const [newGoalId, setNewGoalId] = useState<string | null>(null)
  const [repeatMode, setRepeatMode] = useState<'once' | 'daily' | 'weekdays' | 'weekends' | 'custom'>('once')
  const [customDays, setCustomDays] = useState<boolean[]>([true, true, true, true, true, true, true]) // Mon-Sun

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 })
    return weekOffset === 0 ? base : weekOffset > 0 ? addWeeks(base, weekOffset) : subWeeks(base, Math.abs(weekOffset))
  }, [weekOffset])

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const tasksByDay = useMemo(() => {
    const map = new Map<string, typeof tasks>()
    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayTasks = tasks
        .filter((t) => t.scheduledDate === dateStr)
        .sort((a, b) => {
          // Sort by start time first, then by order
          if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
          if (a.startTime) return -1
          if (b.startTime) return 1
          return a.order - b.order
        })
      map.set(dateStr, dayTasks)
    }
    return map
  }, [tasks, days])

  const unscheduled = useMemo(
    () => tasks.filter((t) => !t.scheduledDate && t.status !== 'completed'),
    [tasks]
  )

  const handleAddTask = (originDateStr: string) => {
    if (!newTaskTitle.trim()) return

    // Determine which days to create tasks for
    let targetDays: Date[] = []

    if (repeatMode === 'once') {
      const dayIndex = days.findIndex((d) => format(d, 'yyyy-MM-dd') === originDateStr)
      if (dayIndex >= 0) targetDays = [days[dayIndex]]
    } else if (repeatMode === 'daily') {
      targetDays = [...days]
    } else if (repeatMode === 'weekdays') {
      // Mon(0) through Fri(4) in our array (Mon-start week)
      targetDays = days.slice(0, 5)
    } else if (repeatMode === 'weekends') {
      // Sat(5) and Sun(6)
      targetDays = days.slice(5, 7)
    } else if (repeatMode === 'custom') {
      targetDays = days.filter((_, i) => customDays[i])
    }

    for (const day of targetDays) {
      addTask(
        newTaskTitle.trim(), '', newTaskPriority, 25,
        format(day, 'yyyy-MM-dd'),
        newStartTime || null,
        newEndTime || null,
        newGoalId
      )
    }

    setNewTaskTitle('')
    setNewTaskPriority('normal')
    setNewStartTime('')
    setNewEndTime('')
    setNewGoalId(null)
    setRepeatMode('once')
    setCustomDays([true, true, true, true, true, true, true])
    setAddingDay(null)
  }

  const handleScheduleTask = (taskId: string, dateStr: string) => {
    updateTask(taskId, { scheduledDate: dateStr })
  }

  const activeGoals = goals.filter((g) => !g.completedAt)

  return (
    <div className="px-4 py-8 md:px-10 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1
            className="font-heading font-bold text-forge-100 mb-1"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          >
            Weekly Plan
          </h1>
          <p className="text-forge-500 text-sm">
            {format(days[0], 'MMM d')} — {format(days[6], 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 text-forge-400 hover:text-forge-200 hover:bg-forge-800 rounded-lg transition-colors duration-150"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-1.5 text-xs font-heading font-semibold rounded-md transition-all duration-150 ${
              weekOffset === 0
                ? 'bg-ember/10 text-ember'
                : 'text-forge-400 hover:text-forge-200 hover:bg-forge-800'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 text-forge-400 hover:text-forge-200 hover:bg-forge-800 rounded-lg transition-colors duration-150"
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-forge-800 rounded-lg overflow-hidden mb-8">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayTasks = tasksByDay.get(dateStr) || []
          const today = isToday(day)
          const past = isBefore(startOfDay(day), startOfDay(new Date()))
          const isAdding = addingDay === dateStr

          return (
            <div
              key={dateStr}
              className={`bg-forge-900 min-h-[140px] md:min-h-[200px] flex flex-col ${
                today ? 'ring-1 ring-ember/30 ring-inset' : ''
              } ${past && !today ? 'opacity-60' : ''}`}
            >
              {/* Day header */}
              <div className={`flex items-center justify-between px-3 py-2 border-b border-forge-800 ${
                today ? 'bg-ember/5' : ''
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-heading font-semibold uppercase tracking-wide ${
                    today ? 'text-ember' : 'text-forge-500'
                  }`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-sm font-heading font-bold ${
                    today ? 'text-ember' : 'text-forge-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAddingDay(isAdding ? null : dateStr)
                    setNewTaskTitle('')
                    setNewStartTime('')
                    setNewEndTime('')
                  }}
                  className="p-2 -m-1 text-forge-600 hover:text-forge-300 rounded transition-colors duration-150"
                  aria-label={`Add task for ${format(day, 'EEEE')}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex-1 px-1.5 py-1.5 space-y-0.5 overflow-y-auto">
                <AnimatePresence>
                  {dayTasks.map((task) => {
                    const goal = task.goalId ? goals.find((g) => g.id === task.goalId) : null
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: easeOutExpo }}
                        className={`group flex flex-col px-2 py-1.5 rounded border-l-2 ${
                          priorityBorders[task.priority]
                        } ${
                          task.status === 'completed' ? 'opacity-50' : 'hover:bg-forge-850'
                        } transition-colors duration-150`}
                      >
                        {/* Time block indicator */}
                        {task.startTime && (
                          <div className="flex items-center gap-1 mb-0.5">
                            <Clock size={10} className="text-forge-600" />
                            <span className="text-xs text-forge-500 font-heading tabular-nums">
                              {task.startTime}{task.endTime ? `–${task.endTime}` : ''}
                            </span>
                          </div>
                        )}

                        <div className="flex items-start gap-1.5">
                          <button
                            onClick={() => task.status !== 'completed' && completeTask(task.id)}
                            disabled={task.status === 'completed'}
                            className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors ${
                              task.status === 'completed'
                                ? 'bg-cool border-cool text-forge-50'
                                : 'border-forge-600 hover:border-forge-400'
                            }`}
                          >
                            {task.status === 'completed' && <Check size={10} strokeWidth={3} />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-xs leading-snug block truncate ${
                                task.status === 'completed'
                                  ? 'line-through text-forge-500'
                                  : 'text-forge-200'
                              }`}
                            >
                              {priorityShapes[task.priority] && (
                                <span className="text-heat font-bold mr-0.5">
                                  {priorityShapes[task.priority]}
                                </span>
                              )}
                              {task.title}
                            </span>
                            {/* Goal badge */}
                            {goal && (
                              <span
                                className="inline-flex items-center gap-1 mt-0.5 text-[11px] px-1 py-0.5 rounded"
                                style={{ background: `${goal.color}20`, color: goal.color }}
                              >
                                {goal.title.slice(0, 10)}{goal.title.length > 10 ? '..' : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity">
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => { setFocus(task.id); setView('tasks') }}
                                className="p-1.5 text-ember hover:text-ember-bright -m-1"
                                aria-label="Focus on this task"
                              >
                                <Crosshair size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 text-forge-600 hover:text-heat -m-1"
                              aria-label="Delete task"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Inline add form with time block */}
                {isAdding && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="pt-1.5 space-y-1.5"
                  >
                    {/* Task title FIRST — lowest friction for ADHD */}
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTask(dateStr)
                        if (e.key === 'Escape') setAddingDay(null)
                      }}
                      autoFocus
                      placeholder="What needs doing?"
                      className="w-full bg-forge-850 border border-forge-700 rounded px-2 py-1.5 text-xs text-forge-100 placeholder:text-forge-600 outline-none focus:border-ember/50"
                    />

                    {/* Time block row */}
                    <div className="flex items-center gap-1">
                      <input
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="bg-forge-900 border border-forge-700 rounded px-1.5 py-1 text-xs text-forge-200 outline-none focus:border-ember/50 w-[78px]"
                        aria-label="Start time"
                      />
                      <span className="text-forge-600 text-xs">—</span>
                      <input
                        type="time"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        className="bg-forge-900 border border-forge-700 rounded px-1.5 py-1 text-xs text-forge-200 outline-none focus:border-ember/50 w-[78px]"
                        aria-label="End time"
                      />
                    </div>

                    {/* Priority + repeat on one row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Priority dots — larger touch targets */}
                      {(['urgent', 'high', 'normal', 'low'] as Priority[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => setNewTaskPriority(p)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 ${priorityColors[p]} ${
                            newTaskPriority === p ? 'ring-2 ring-forge-400 ring-offset-1 ring-offset-forge-900 opacity-100' : 'opacity-30 hover:opacity-60'
                          }`}
                          aria-label={`${p} priority`}
                        >
                          {p === 'urgent' && <span className="text-[8px] font-bold text-forge-950">!!</span>}
                          {p === 'high' && <span className="text-[8px] font-bold text-forge-950">!</span>}
                        </button>
                      ))}

                      <span className="text-forge-700">|</span>

                      {/* Repeat — compact */}
                      <Repeat size={11} className="text-forge-600" />
                      {([
                        { value: 'once' as const, label: '1x' },
                        { value: 'daily' as const, label: 'All' },
                        { value: 'weekdays' as const, label: 'M-F' },
                        { value: 'weekends' as const, label: 'S-S' },
                        { value: 'custom' as const, label: '...' },
                      ]).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRepeatMode(opt.value)}
                          className={`px-1.5 py-1 text-xs font-heading font-semibold rounded transition-all duration-150 min-h-[28px] ${
                            repeatMode === opt.value
                              ? 'bg-ember/15 text-ember'
                              : 'text-forge-500 hover:text-forge-300 hover:bg-forge-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom day picker — bigger touch targets */}
                    {repeatMode === 'custom' && (
                      <div className="flex gap-1">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((label, i) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => {
                              const next = [...customDays]
                              next[i] = !next[i]
                              setCustomDays(next)
                            }}
                            className={`flex-1 py-1.5 text-xs font-heading font-bold rounded transition-all duration-150 min-h-[32px] ${
                              customDays[i]
                                ? 'bg-ember text-forge-950'
                                : 'bg-forge-800 text-forge-500 hover:text-forge-300'
                            }`}
                            aria-label={`${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i]}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Goal selector */}
                    {activeGoals.length > 0 && (
                      <select
                        value={newGoalId || ''}
                        onChange={(e) => setNewGoalId(e.target.value || null)}
                        className="w-full bg-forge-900 border border-forge-700 rounded px-1.5 py-1.5 text-xs text-forge-300 outline-none focus:border-ember/50"
                        aria-label="Link to goal"
                      >
                        <option value="">No goal</option>
                        {activeGoals.map((g) => (
                          <option key={g.id} value={g.id}>{g.title}</option>
                        ))}
                      </select>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Unscheduled tasks */}
      {unscheduled.length > 0 && (
        <section>
          <h2 className="font-heading font-semibold text-forge-400 text-sm mb-3 flex items-center gap-2">
            <Calendar size={14} />
            Unscheduled ({unscheduled.length})
          </h2>
          <p className="text-forge-600 text-xs mb-3">
            Click a day letter to schedule a task to that day.
          </p>
          <div className="flex flex-col gap-1">
            {unscheduled.slice(0, 15).map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-forge-850 transition-colors duration-150"
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                <span className="text-sm text-forge-200 flex-1 truncate">{task.title}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity">
                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleScheduleTask(task.id, dateStr)}
                        className={`px-2 py-1 text-xs font-heading font-semibold rounded transition-colors duration-150 min-w-[28px] text-center ${
                          isToday(day)
                            ? 'text-ember hover:bg-ember/10'
                            : 'text-forge-500 hover:text-forge-300 hover:bg-forge-800'
                        }`}
                        title={`Schedule for ${format(day, 'EEEE')}`}
                      >
                        {format(day, 'EEE').charAt(0)}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

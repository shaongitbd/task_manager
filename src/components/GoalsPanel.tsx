import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, Check, Trash2, ChevronDown, Link2, Calendar } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'
import { format } from 'date-fns'

const easeOutExpo = [0.16, 1, 0.3, 1] as const

const goalColors = [
  '#e8930a', '#5b9fd4', '#3a9e7e', '#d4705a', '#a78bda', '#d4a05a',
]

export function GoalsPanel() {
  const goals = useTaskStore((s) => s.goals)
  const tasks = useTaskStore((s) => s.tasks)
  const addGoal = useTaskStore((s) => s.addGoal)
  const deleteGoal = useTaskStore((s) => s.deleteGoal)
  const completeGoal = useTaskStore((s) => s.completeGoal)
  const updateTask = useTaskStore((s) => s.updateTask)

  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState(goalColors[0])
  const [newTarget, setNewTarget] = useState('')
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [linkingGoal, setLinkingGoal] = useState<string | null>(null)

  const activeGoals = goals.filter((g) => !g.completedAt)
  const completedGoals = goals.filter((g) => g.completedAt)

  const handleAdd = () => {
    if (!newTitle.trim()) return
    addGoal(newTitle.trim(), newDesc.trim(), newColor, newTarget || null)
    setNewTitle('')
    setNewDesc('')
    setNewColor(goalColors[0])
    setNewTarget('')
    setShowAdd(false)
  }

  const unlinkedTasks = useMemo(
    () => tasks.filter((t) => !t.goalId && t.status !== 'completed'),
    [tasks]
  )

  return (
    <div className="px-6 py-8 md:px-10 md:py-12 max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1
          className="font-heading font-bold text-forge-100"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
        >
          Goals
        </h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-semibold text-ember bg-ember/10 rounded-md hover:bg-ember/20 transition-colors duration-150"
        >
          <Plus size={14} />
          New Goal
        </button>
      </div>
      <p className="text-forge-500 text-sm mb-8">
        Set bigger objectives and link tasks to them.
      </p>

      {/* Add goal form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: easeOutExpo }}
            className="overflow-hidden mb-6"
          >
            <div className="p-4 bg-forge-850 border border-forge-750 rounded-lg space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Goal title (e.g., Read 'Atomic Habits')"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="w-full bg-transparent text-forge-100 text-base font-heading font-semibold placeholder:text-forge-600 outline-none"
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Why is this important? (optional)"
                rows={2}
                className="w-full bg-forge-900 border border-forge-750 rounded-md px-3 py-2 text-sm text-forge-200 placeholder:text-forge-600 outline-none resize-none focus:border-ember/40"
              />
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-forge-500">Color:</span>
                  {goalColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-5 h-5 rounded-full transition-all duration-150 ${
                        newColor === c ? 'ring-2 ring-forge-300 ring-offset-2 ring-offset-forge-850' : 'opacity-50 hover:opacity-80'
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-forge-500" />
                  <input
                    type="date"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="bg-forge-900 border border-forge-750 rounded-md px-2 py-1 text-xs text-forge-200 outline-none focus:border-ember/40"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!newTitle.trim()}
                  className="ml-auto px-4 py-1.5 bg-ember text-forge-950 font-heading font-semibold text-sm rounded-md hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active goals */}
      <div className="space-y-3 mb-8">
        {activeGoals.length === 0 && !showAdd && (
          <div className="py-10 text-center">
            <Target size={32} className="text-forge-700 mx-auto mb-3" />
            <p className="text-forge-500 font-heading text-lg">No goals yet</p>
            <p className="text-forge-600 text-sm mt-1">
              Set a goal like "Read this book" or "Learn cooking" and link tasks to it
            </p>
          </div>
        )}

        <AnimatePresence>
          {activeGoals.map((goal) => {
            const goalTasks = tasks.filter((t) => t.goalId === goal.id)
            const completed = goalTasks.filter((t) => t.status === 'completed').length
            const total = goalTasks.length
            const progress = total > 0 ? completed / total : 0
            const isExpanded = expandedGoal === goal.id
            const isLinking = linkingGoal === goal.id

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: easeOutExpo }}
                className="bg-forge-900 border border-forge-800 rounded-lg overflow-hidden"
              >
                {/* Goal header */}
                <button
                  onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-forge-850 transition-colors duration-150"
                >
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: goal.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-base font-heading font-semibold text-forge-100 block truncate">
                      {goal.title}
                    </span>
                    {goal.targetDate && (
                      <span className="text-xs text-forge-500">
                        Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-forge-500 tabular-nums">
                      {completed}/{total}
                    </span>
                    <div className="w-16 h-1.5 bg-forge-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress * 100}%`, background: goal.color }}
                      />
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-forge-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: easeOutExpo }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-forge-800 pt-3">
                        {goal.description && (
                          <p className="text-sm text-forge-400 mb-3">{goal.description}</p>
                        )}

                        {/* Linked tasks */}
                        {goalTasks.length > 0 && (
                          <div className="space-y-1 mb-3">
                            {goalTasks.map((t) => (
                              <div
                                key={t.id}
                                className="flex items-center gap-2 px-2 py-1.5 rounded text-sm"
                              >
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                    t.status === 'completed'
                                      ? 'bg-cool border-cool text-forge-50'
                                      : 'border-forge-600'
                                  }`}
                                >
                                  {t.status === 'completed' && <Check size={10} strokeWidth={3} />}
                                </div>
                                <span
                                  className={`flex-1 truncate ${
                                    t.status === 'completed' ? 'line-through text-forge-500' : 'text-forge-200'
                                  }`}
                                >
                                  {t.title}
                                </span>
                                {t.startTime && (
                                  <span className="text-xs text-forge-500">{t.startTime}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Link tasks to this goal */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setLinkingGoal(isLinking ? null : goal.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-forge-400 border border-forge-700 rounded-md hover:text-forge-200 hover:border-forge-600 transition-colors duration-150"
                          >
                            <Link2 size={12} />
                            Link existing task
                          </button>
                          <button
                            onClick={() => completeGoal(goal.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-cool border border-cool/30 rounded-md hover:bg-cool/10 transition-colors duration-150"
                          >
                            <Check size={12} />
                            Goal done
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-forge-500 hover:text-heat transition-colors duration-150 ml-auto"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Task linker */}
                        <AnimatePresence>
                          {isLinking && unlinkedTasks.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: easeOutExpo }}
                              className="mt-3 pt-3 border-t border-forge-800 space-y-1 overflow-hidden"
                            >
                              <p className="text-xs text-forge-500 mb-2">Select tasks to link:</p>
                              {unlinkedTasks.slice(0, 8).map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => {
                                    updateTask(t.id, { goalId: goal.id })
                                  }}
                                  className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded text-sm text-forge-300 hover:bg-forge-800 transition-colors duration-150"
                                >
                                  <Plus size={12} className="text-forge-600" />
                                  <span className="truncate">{t.title}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-forge-600 text-xs tracking-widest uppercase mb-3">
            Completed Goals ({completedGoals.length})
          </h2>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-forge-900/50 opacity-60"
              >
                <div className="w-4 h-4 rounded-sm bg-cool flex items-center justify-center">
                  <Check size={10} strokeWidth={3} className="text-forge-50" />
                </div>
                <span className="text-sm text-forge-400 line-through flex-1 truncate">
                  {goal.title}
                </span>
                {goal.completedAt && (
                  <span className="text-xs text-forge-600">
                    {format(new Date(goal.completedAt), 'MMM d')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

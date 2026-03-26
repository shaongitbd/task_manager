import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Coffee, Target, Clock, Shuffle, Plus, HelpCircle, Zap, Pencil, StickyNote, Trash2 } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'
import { playSuccessSound } from '@/lib/sounds'
import { toast } from 'sonner'

const easeOutExpo = [0.16, 1, 0.3, 1] as const
const easeOutQuart = [0.25, 1, 0.5, 1] as const

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: easeOutExpo },
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

export function CurrentFocus() {
  const focusedTaskId = useTaskStore((s) => s.focusedTaskId)
  const tasks = useTaskStore((s) => s.tasks)
  const completeTask = useTaskStore((s) => s.completeTask)
  const setFocus = useTaskStore((s) => s.setFocus)
  const settings = useTaskStore((s) => s.settings)
  const pickTaskForMe = useTaskStore((s) => s.pickTaskForMe)
  const addSubtask = useTaskStore((s) => s.addSubtask)
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask)
  const deleteSubtask = useTaskStore((s) => s.deleteSubtask)
  const parkThought = useTaskStore((s) => s.parkThought)

  const [showStuck, setShowStuck] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [quickThought, setQuickThought] = useState('')
  const [showThoughtInput, setShowThoughtInput] = useState(false)

  const focusedTask = tasks.find((t) => t.id === focusedTaskId)
  const hasPendingTasks = tasks.some((t) => t.status !== 'completed')

  const progress = useMemo(() => {
    if (!focusedTask) return 0
    const totalEstimated = focusedTask.estimatedMinutes * 60
    if (totalEstimated <= 0) return 0
    return Math.min(1, focusedTask.elapsedSeconds / totalEstimated)
  }, [focusedTask])

  const heatColor = useMemo(() => {
    if (progress < 0.5) return '#e8930a'
    if (progress < 0.8) return '#e07b0a'
    if (progress < 1) return '#d4540a'
    return '#c0392b'
  }, [progress])

  const handleComplete = () => {
    if (!focusedTask) return
    if (settings.soundEnabled) playSuccessSound()
    completeTask(focusedTask.id)
    toast.success(`"${focusedTask.title}" — done!`)
  }

  const handleBreak = () => {
    setFocus(null)
    toast('Taking a break. I\'ll remind you to come back.', { icon: <Coffee size={16} /> })
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim() || !focusedTask) return
    addSubtask(focusedTask.id, newSubtask.trim())
    setNewSubtask('')
  }

  const handleParkThought = () => {
    if (!quickThought.trim()) return
    parkThought(quickThought.trim())
    setQuickThought('')
    setShowThoughtInput(false)
    toast('Thought parked. Back to work!', { icon: <StickyNote size={14} /> })
  }

  const subtasks = focusedTask?.subtasks || []
  const subtasksDone = subtasks.filter((s) => s.done).length

  return (
    <section className="relative px-6 pt-8 pb-6 md:px-10 md:pt-12 md:pb-8">
      {/* Breathing left accent when focused */}
      <AnimatePresence>
        {focusedTask && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full origin-center"
            style={{ background: heatColor }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {focusedTask ? (
          <motion.div
            key="focused"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Status label */}
            <motion.div variants={staggerItem} className="flex items-center gap-2 mb-4">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: heatColor }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-xs font-heading font-semibold tracking-widest uppercase" style={{ color: heatColor }}>
                Now Forging
              </span>
            </motion.div>

            {/* Task title */}
            <motion.h1
              variants={staggerItem}
              className="font-heading font-bold text-forge-50 leading-tight mb-3"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
            >
              {focusedTask.title}
            </motion.h1>

            {focusedTask.description && (
              <motion.p variants={staggerItem} className="text-forge-400 text-base mb-4 max-w-2xl leading-relaxed">
                {focusedTask.description}
              </motion.p>
            )}

            {/* Subtasks checklist */}
            {subtasks.length > 0 && (
              <motion.div variants={staggerItem} className="mb-4 max-w-lg">
                <div className="text-xs text-forge-500 mb-2 font-heading">
                  Steps: {subtasksDone}/{subtasks.length}
                </div>
                <div className="space-y-1">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => toggleSubtask(focusedTask.id, st.id)}
                        aria-label={st.done ? `${st.title} — completed` : `Mark "${st.title}" done`}
                        className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                          st.done ? 'bg-cool border-cool text-forge-50' : 'border-forge-600 hover:border-forge-400'
                        }`}
                      >
                        {st.done && <Check size={10} strokeWidth={3} />}
                      </button>
                      <span className={`text-sm flex-1 ${st.done ? 'line-through text-forge-500' : 'text-forge-200'}`}>
                        {st.title}
                      </span>
                      <button
                        onClick={() => deleteSubtask(focusedTask.id, st.id)}
                        className="p-0.5 text-forge-700 hover:text-heat opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Add subtask inline */}
            <motion.div variants={staggerItem} className="mb-6 max-w-lg">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="+ Add a small step..."
                  className="flex-1 bg-transparent text-sm text-forge-300 placeholder:text-forge-600 outline-none border-b border-transparent focus:border-forge-700 py-1 transition-colors"
                />
              </div>
            </motion.div>

            {/* Timer + progress bar */}
            <motion.div variants={staggerItem} className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-forge-500" />
                  <span className="font-heading font-semibold text-2xl tabular-nums" style={{ color: heatColor }}>
                    {formatTime(focusedTask.elapsedSeconds)}
                  </span>
                </div>
                <span className="text-forge-600 text-sm">of {focusedTask.estimatedMinutes}m estimated</span>
              </div>
              <div className="relative h-1.5 bg-forge-800 rounded-full overflow-hidden max-w-lg">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: heatColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: easeOutQuart }}
                />
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={staggerItem} className="flex gap-2 flex-wrap mb-4">
              <motion.button
                onClick={handleComplete}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-cool text-forge-50 font-heading font-semibold text-sm rounded-lg hover:brightness-110 transition-[filter] duration-150"
              >
                <Check size={18} strokeWidth={2.5} />
                I'm Done!
              </motion.button>
              <motion.button
                onClick={() => setShowStuck(!showStuck)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-4 py-2.5 border font-heading font-medium text-sm rounded-lg transition-all duration-150 ${
                  showStuck ? 'border-ember text-ember bg-ember/5' : 'border-forge-700 text-forge-400 hover:border-forge-600 hover:text-forge-300'
                }`}
              >
                <HelpCircle size={16} />
                I'm Stuck
              </motion.button>
              <motion.button
                onClick={handleBreak}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2.5 border border-forge-700 text-forge-400 font-heading font-medium text-sm rounded-lg hover:border-forge-600 hover:text-forge-300 transition-all duration-150"
              >
                <Coffee size={16} />
                Break
              </motion.button>
            </motion.div>

            {/* I'm Stuck panel */}
            <AnimatePresence>
              {showStuck && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: easeOutExpo }}
                  className="overflow-hidden max-w-lg mb-4"
                >
                  <div className="py-3 space-y-2">
                    <p className="text-sm text-forge-400 mb-3">It's okay. Try one of these:</p>
                    <button
                      onClick={() => {
                        setShowStuck(false)
                        setNewSubtask('')
                        // Focus the subtask input
                        const input = document.querySelector<HTMLInputElement>('input[placeholder="+ Add a small step..."]')
                        input?.focus()
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-forge-850 hover:bg-forge-800 text-forge-200 text-sm transition-colors"
                    >
                      <Plus size={14} className="text-ember" />
                      <div>
                        <div className="font-medium">Break it smaller</div>
                        <div className="text-xs text-forge-500">Add tiny steps you can check off</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowStuck(false)
                        // Focus a different task
                        const otherTasks = tasks.filter((t) => t.id !== focusedTask.id && t.status !== 'completed')
                        if (otherTasks.length > 0) {
                          pickTaskForMe()
                          toast('Switched to a different task. Build some momentum!')
                        }
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-forge-850 hover:bg-forge-800 text-forge-200 text-sm transition-colors"
                    >
                      <Shuffle size={14} className="text-steel" />
                      <div>
                        <div className="font-medium">Do something else first</div>
                        <div className="text-xs text-forge-500">Build momentum on an easier task</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowStuck(false)
                        useTaskStore.getState().updateTask(focusedTask.id, { estimatedMinutes: 5, elapsedSeconds: 0 })
                        toast('5-minute sprint! Just 5 minutes. You can stop after.', { icon: <Zap size={14} /> })
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-forge-850 hover:bg-forge-800 text-forge-200 text-sm transition-colors"
                    >
                      <Zap size={14} className="text-ember-bright" />
                      <div>
                        <div className="font-medium">5-minute sprint</div>
                        <div className="text-xs text-forge-500">Just do 5 minutes. You can stop after.</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowStuck(false)
                        // Trigger edit mode — just update description with a prompt
                        const newTitle = prompt('Rewrite the task more specifically:', focusedTask.title)
                        if (newTitle?.trim()) {
                          useTaskStore.getState().updateTask(focusedTask.id, { title: newTitle.trim() })
                        }
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg bg-forge-850 hover:bg-forge-800 text-forge-200 text-sm transition-colors"
                    >
                      <Pencil size={14} className="text-forge-400" />
                      <div>
                        <div className="font-medium">Rewrite the task</div>
                        <div className="text-xs text-forge-500">Maybe it's too vague — make it specific</div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick thought parking lot */}
            <motion.div variants={staggerItem}>
              {showThoughtInput ? (
                <div className="flex items-center gap-2 max-w-md">
                  <StickyNote size={14} className="text-forge-600 flex-shrink-0" />
                  <input
                    type="text"
                    value={quickThought}
                    onChange={(e) => setQuickThought(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleParkThought()
                      if (e.key === 'Escape') { setShowThoughtInput(false); setQuickThought('') }
                    }}
                    autoFocus
                    placeholder="Park a thought so you don't lose it..."
                    className="flex-1 bg-transparent text-sm text-forge-300 placeholder:text-forge-600 outline-none border-b border-forge-700 py-1"
                  />
                  <button onClick={handleParkThought} className="text-xs text-ember hover:text-ember-bright">Save</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowThoughtInput(true)}
                  className="flex items-center gap-1.5 text-xs text-forge-600 hover:text-forge-400 transition-colors"
                >
                  <StickyNote size={12} />
                  Park a thought
                </button>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: easeOutQuart }}
            className="py-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
              >
                <Target size={18} className="text-forge-600" />
              </motion.div>
              <span className="text-xs font-heading font-semibold tracking-widest uppercase text-forge-600">
                No Active Focus
              </span>
            </div>
            <h2
              className="font-heading font-bold text-forge-300 leading-tight mb-2"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
            >
              What should you be working on?
            </h2>
            <p className="text-forge-500 text-base max-w-lg mb-6">
              Pick a task below, or let me choose for you.
            </p>

            {/* Pick for me button — THE decision fatigue killer */}
            {hasPendingTasks && (
              <motion.button
                onClick={pickTaskForMe}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-6 py-3 bg-ember text-forge-950 font-heading font-bold text-base rounded-lg hover:brightness-110 transition-[filter] duration-150"
              >
                <Shuffle size={18} />
                Pick for me
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-6 right-6 md:left-10 md:right-10 h-px bg-forge-800" />
    </section>
  )
}

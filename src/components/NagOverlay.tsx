import { motion } from 'framer-motion'
import { ArrowRight, Check, SkipForward, Shuffle } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'
import { playSuccessSound } from '@/lib/sounds'
import type { Task } from '@/types/task'
import { toast } from 'sonner'

const easeOutExpo = [0.16, 1, 0.3, 1] as const

interface NagOverlayProps {
  task: Task | null
  onDismiss: () => void
}

const nagMessages = {
  withTask: [
    "Hey — you should be working on this:",
    "Focus check. Here's your current task:",
    "Don't drift. You're supposed to be on:",
    "Quick check-in. Still working on this?",
    "Your task is waiting:",
  ],
  withoutTask: [
    "You're not working on anything right now.",
    "No active task. Time to pick one.",
    "What are you doing? Pick a task!",
    "You have tasks waiting. Choose one.",
    "Focus up. Select something to work on.",
  ],
}

function getRandomMessage(hasTask: boolean): string {
  const list = hasTask ? nagMessages.withTask : nagMessages.withoutTask
  return list[Math.floor(Math.random() * list.length)]
}

export function NagOverlay({ task, onDismiss }: NagOverlayProps) {
  const completeTask = useTaskStore((s) => s.completeTask)
  const tasks = useTaskStore((s) => s.tasks)
  const setFocus = useTaskStore((s) => s.setFocus)
  const settings = useTaskStore((s) => s.settings)
  const pickTaskForMe = useTaskStore((s) => s.pickTaskForMe)
  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const message = getRandomMessage(!!task)

  const handleFinished = () => {
    if (task) {
      if (settings.soundEnabled) playSuccessSound()
      completeTask(task.id)
      toast.success(`"${task.title}" — done!`)
    }
    onDismiss()
  }

  const handleOnIt = () => {
    onDismiss()
  }

  const handlePickTask = (id: string) => {
    setFocus(id)
    onDismiss()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label="Focus reminder"
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(15, 13, 11, 0.92)' }}
    >
      {/* Brief ember flash on entrance — demands attention */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(232, 147, 10, 0.15) 0%, transparent 70%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.6, ease: 'easeOut', times: [0, 0.3, 1] }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.05 }}
        className="relative max-w-xl w-full mx-4 text-left"
      >
        {/* Accent line — grows in from left */}
        <motion.div
          className="h-1 bg-ember rounded-full mb-6"
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.15 }}
        />

        {/* Message */}
        <motion.p
          className="text-forge-400 text-lg font-heading mb-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOutExpo, delay: 0.2 }}
        >
          {message}
        </motion.p>

        {task ? (
          <>
            {/* Task name — BIG, arrives with emphasis */}
            <motion.h2
              className="font-heading font-bold text-forge-50 leading-tight mb-8"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: easeOutExpo, delay: 0.28 }}
            >
              {task.title}
            </motion.h2>

            {/* Buttons — staggered entrance */}
            <div className="flex flex-col sm:flex-row gap-3">
              {[
                {
                  onClick: handleOnIt,
                  className: 'bg-ember text-forge-950 font-bold',
                  icon: <ArrowRight size={18} />,
                  label: "I'm on it",
                },
                {
                  onClick: handleFinished,
                  className: 'bg-cool text-forge-50 font-semibold',
                  icon: <Check size={18} strokeWidth={2.5} />,
                  label: 'I finished',
                },
                {
                  onClick: onDismiss,
                  className: 'border border-forge-700 text-forge-400 font-medium hover:border-forge-600 hover:text-forge-300',
                  icon: <SkipForward size={16} />,
                  label: 'Skip',
                },
              ].map((btn, i) => (
                <motion.button
                  key={btn.label}
                  onClick={btn.onClick}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: easeOutExpo, delay: 0.4 + i * 0.07 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={`flex items-center justify-center gap-2 px-6 py-3 font-heading text-base rounded-lg transition-[filter,border-color,color] duration-150 hover:brightness-110 ${btn.className}`}
                >
                  {btn.icon}
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <>
            <motion.h2
              className="font-heading font-bold text-forge-50 leading-tight mb-6"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: easeOutExpo, delay: 0.28 }}
            >
              Pick something to focus on
            </motion.h2>

            {pendingTasks.length > 0 ? (
              <div className="flex flex-col gap-2 mb-6 max-h-64 overflow-y-auto">
                {pendingTasks.slice(0, 5).map((t, i) => (
                  <motion.button
                    key={t.id}
                    onClick={() => handlePickTask(t.id)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: easeOutExpo, delay: 0.35 + i * 0.06 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 text-left px-4 py-3 bg-forge-850 rounded-lg hover:bg-forge-800 transition-colors duration-150 group"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background:
                          t.priority === 'urgent' ? '#d4705a'
                          : t.priority === 'high' ? '#e8930a'
                          : t.priority === 'normal' ? '#5b9fd4'
                          : '#8a837c',
                      }}
                    />
                    <span className="text-forge-200 font-medium truncate flex-1">
                      {t.title}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-forge-600 group-hover:text-ember transition-colors"
                    />
                  </motion.button>
                ))}
              </div>
            ) : (
              <p className="text-forge-500 mb-6">
                No tasks yet. Add one and get started.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {pendingTasks.length > 0 && (
                <motion.button
                  onClick={() => { pickTaskForMe(); onDismiss() }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-ember text-forge-950 font-heading font-bold text-base rounded-lg hover:brightness-110 transition-[filter] duration-150"
                >
                  <Shuffle size={18} />
                  Pick for me
                </motion.button>
              )}
              <motion.button
                onClick={onDismiss}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-forge-700 text-forge-400 font-heading font-medium text-base rounded-lg hover:border-forge-600 hover:text-forge-300 transition-all duration-150"
              >
                Dismiss
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

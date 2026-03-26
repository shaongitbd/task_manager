import { motion } from 'framer-motion'
import { ArrowRight, Shuffle, Coffee, PartyPopper } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'

const easeOutExpo = [0.16, 1, 0.3, 1] as const

const celebrations = [
  "Nice work!",
  "Another one down!",
  "You're on fire!",
  "That's the momentum!",
  "Keep forging ahead!",
  "Crushed it!",
]

export function TransitionOverlay() {
  const dismissTransition = useTaskStore((s) => s.dismissTransition)
  const lastCompletedTaskTitle = useTaskStore((s) => s.lastCompletedTaskTitle)
  const pickTaskForMe = useTaskStore((s) => s.pickTaskForMe)
  const setFocus = useTaskStore((s) => s.setFocus)
  const tasks = useTaskStore((s) => s.tasks)

  const pendingTasks = tasks
    .filter((t) => t.status !== 'completed')
    .slice(0, 3)

  const celebration = celebrations[Math.floor(Math.random() * celebrations.length)]

  const handlePickForMe = () => {
    pickTaskForMe()
    dismissTransition()
  }

  const handlePickTask = (id: string) => {
    setFocus(id)
    dismissTransition()
  }

  const handleBreak = () => {
    dismissTransition()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label="Task completed"
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ background: 'rgba(15, 13, 11, 0.92)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.05 }}
        className="max-w-md w-full mx-4 text-left"
      >
        {/* Celebration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.1 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="w-8 h-8 bg-cool/15 rounded-lg flex items-center justify-center">
            <PartyPopper size={18} className="text-cool" />
          </div>
          <span className="text-cool font-heading font-bold text-lg">{celebration}</span>
        </motion.div>

        {/* What was completed */}
        {lastCompletedTaskTitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-forge-500 text-sm mb-6"
          >
            Completed: <span className="text-forge-300 line-through">{lastCompletedTaskTitle}</span>
          </motion.p>
        )}

        {/* What's next */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOutExpo, delay: 0.25 }}
          className="font-heading font-bold text-forge-100 text-xl mb-4"
        >
          What's next?
        </motion.h2>

        {/* Quick pick options */}
        {pendingTasks.length > 0 && (
          <div className="space-y-1.5 mb-5">
            {pendingTasks.map((t, i) => (
              <motion.button
                key={t.id}
                onClick={() => handlePickTask(t.id)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: easeOutExpo, delay: 0.3 + i * 0.06 }}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 bg-forge-850 rounded-lg hover:bg-forge-800 transition-colors duration-150 group"
              >
                <span className="text-forge-200 font-medium truncate flex-1">{t.title}</span>
                <ArrowRight size={14} className="text-forge-600 group-hover:text-ember transition-colors" />
              </motion.button>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-2"
        >
          {pendingTasks.length > 0 && (
            <motion.button
              onClick={handlePickForMe}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-ember text-forge-950 font-heading font-bold text-sm rounded-lg hover:brightness-110 transition-[filter] duration-150"
            >
              <Shuffle size={16} />
              Pick for me
            </motion.button>
          )}
          <motion.button
            onClick={handleBreak}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-forge-700 text-forge-400 font-heading font-medium text-sm rounded-lg hover:border-forge-600 hover:text-forge-300 transition-all duration-150"
          >
            <Coffee size={16} />
            Take a break
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

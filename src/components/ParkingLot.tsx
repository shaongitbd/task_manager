import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, ArrowRight, Trash2, ListTodo } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'
import { format } from 'date-fns'

const easeOutExpo = [0.16, 1, 0.3, 1] as const

export function ParkingLot() {
  const parkedThoughts = useTaskStore((s) => s.parkedThoughts)
  const deleteParkedThought = useTaskStore((s) => s.deleteParkedThought)
  const convertThoughtToTask = useTaskStore((s) => s.convertThoughtToTask)
  const parkThought = useTaskStore((s) => s.parkThought)

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 border-t border-forge-800">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote size={16} className="text-ember-dim" />
        <h2 className="font-heading font-semibold text-forge-300 text-sm">
          Parking Lot
        </h2>
        <span className="text-xs text-forge-600">
          {parkedThoughts.length} thought{parkedThoughts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {parkedThoughts.length === 0 ? (
        <p className="text-forge-600 text-sm">
          No parked thoughts. Use "Park a thought" while focused to capture ideas without losing focus.
        </p>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence>
            {parkedThoughts.map((thought) => (
              <motion.div
                key={thought.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: easeOutExpo }}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-forge-850 transition-colors duration-150"
              >
                <span className="text-sm text-forge-200 flex-1">{thought.text}</span>
                <span className="text-[10px] text-forge-600 flex-shrink-0 hidden sm:block">
                  {format(new Date(thought.createdAt), 'MMM d, h:mm a')}
                </span>
                <button
                  onClick={() => convertThoughtToTask(thought.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-ember bg-ember/10 rounded hover:bg-ember/20 transition-colors opacity-0 group-hover:opacity-100 max-md:opacity-100"
                  title="Convert to task"
                >
                  <ListTodo size={11} />
                  <span className="hidden sm:inline">Make task</span>
                </button>
                <button
                  onClick={() => deleteParkedThought(thought.id)}
                  className="p-1 text-forge-600 hover:text-heat transition-colors opacity-0 group-hover:opacity-100 max-md:opacity-100"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Quick add thought here too */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const input = e.currentTarget.elements.namedItem('thought') as HTMLInputElement
          if (input.value.trim()) {
            parkThought(input.value.trim())
            input.value = ''
          }
        }}
        className="mt-3"
      >
        <input
          name="thought"
          type="text"
          placeholder="+ Quick thought..."
          className="w-full bg-transparent text-sm text-forge-300 placeholder:text-forge-600 outline-none border-b border-forge-800 focus:border-forge-600 py-1.5 transition-colors"
        />
      </form>
    </div>
  )
}

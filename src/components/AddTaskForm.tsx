import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'
import type { Priority } from '@/types/task'

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-heat' },
  { value: 'high', label: 'High', color: 'bg-ember' },
  { value: 'normal', label: 'Normal', color: 'bg-steel' },
  { value: 'low', label: 'Low', color: 'bg-ash' },
]

export function AddTaskForm() {
  const addTask = useTaskStore((s) => s.addTask)
  const [title, setTitle] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [estimatedMinutes, setEstimatedMinutes] = useState(25)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask(title.trim(), description.trim(), priority, estimatedMinutes)
    setTitle('')
    setDescription('')
    setPriority('normal')
    setEstimatedMinutes(25)
    setExpanded(false)
  }

  const handleQuickAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !expanded) {
      e.preventDefault()
      if (!title.trim()) return
      addTask(title.trim(), '', 'normal', 25)
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {/* Quick add input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-forge-850 border border-forge-750 rounded-lg px-3 py-2.5 focus-within:border-ember/50 transition-colors duration-200">
          <Plus size={16} className="text-forge-500 flex-shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleQuickAdd}
            placeholder="Add a task... (Enter to quick-add)"
            className="flex-1 bg-transparent text-forge-100 text-base placeholder:text-forge-600 outline-none"
          />
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`p-1 text-forge-500 hover:text-forge-300 rounded transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
            aria-label="More options"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Expanded options */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 flex flex-col gap-3">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full bg-forge-850 border border-forge-750 rounded-lg px-3 py-2.5 text-forge-100 text-sm placeholder:text-forge-600 outline-none focus:border-ember/50 resize-none transition-colors duration-200"
              />

              <div className="flex items-center gap-4 flex-wrap">
                {/* Priority selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-forge-500 mr-1">Priority:</span>
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                        priority === p.value
                          ? 'bg-forge-750 text-forge-100'
                          : 'text-forge-500 hover:text-forge-300 hover:bg-forge-800'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${p.color}`} />
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Time estimate */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-forge-500">Time:</span>
                  <select
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="bg-forge-850 border border-forge-750 rounded-md px-2 py-1.5 text-xs text-forge-200 outline-none focus:border-ember/50"
                  >
                    <option value={5}>5 min</option>
                    <option value={10}>10 min</option>
                    <option value={15}>15 min</option>
                    <option value={25}>25 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="ml-auto px-4 py-1.5 bg-ember text-forge-950 font-heading font-semibold text-sm rounded-md hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                >
                  Add Task
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Crosshair, Trash2, Clock, Check, Pencil } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'
import type { Task, Priority } from '@/types/task'

const easeOutExpo = [0.16, 1, 0.3, 1] as const

// Shape indicators alongside colors for ADHD accessibility
const priorityConfig: Record<Priority, { border: string; label: string; labelColor: string; shape: string }> = {
  urgent: { border: 'priority-urgent', label: '!! Urgent', labelColor: 'text-heat', shape: '!!' },
  high: { border: 'priority-high', label: '! High', labelColor: 'text-ember', shape: '!' },
  normal: { border: 'priority-normal', label: 'Normal', labelColor: 'text-steel', shape: '' },
  low: { border: 'priority-low', label: 'Low', labelColor: 'text-ash', shape: '' },
}

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const setFocus = useTaskStore((s) => s.setFocus)
  const completeTask = useTaskStore((s) => s.completeTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const updateTask = useTaskStore((s) => s.updateTask)
  const focusedTaskId = useTaskStore((s) => s.focusedTaskId)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [justCompleted, setJustCompleted] = useState(false)

  const config = priorityConfig[task.priority]
  const isFocused = focusedTaskId === task.id
  const isCompleted = task.status === 'completed'

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateTask(task.id, { title: editTitle.trim() })
    }
    setEditing(false)
  }

  const handleComplete = useCallback(() => {
    if (isCompleted) return
    setJustCompleted(true)
    // Brief delay so the user sees the check animation before state changes
    setTimeout(() => {
      completeTask(task.id)
    }, 300)
  }, [isCompleted, completeTask, task.id])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: justCompleted ? [1, 1.015, 1] : 1,
      }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
      className={`group relative ${config.border} rounded-r-lg transition-colors duration-200 ${
        isFocused
          ? 'bg-ember/5'
          : isCompleted
            ? 'bg-forge-900/50 opacity-60'
            : 'hover:bg-forge-850'
      }`}
    >
      <div className="flex items-center gap-3 py-3 px-4 pr-3">
        {/* Completion checkbox */}
        <motion.button
          onClick={handleComplete}
          disabled={isCompleted}
          whileTap={!isCompleted ? { scale: 0.85 } : undefined}
          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
            isCompleted || justCompleted
              ? 'bg-cool border-cool text-forge-50'
              : 'border-forge-600 hover:border-forge-400'
          }`}
          aria-label={isCompleted ? 'Completed' : 'Mark complete'}
        >
          {(isCompleted || justCompleted) && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, ease: easeOutExpo }}
            >
              <Check size={12} strokeWidth={3} />
            </motion.div>
          )}
        </motion.button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit()
                if (e.key === 'Escape') setEditing(false)
              }}
              onBlur={handleSaveEdit}
              autoFocus
              className="w-full bg-transparent border-b border-ember text-forge-100 text-base font-medium outline-none py-0.5"
            />
          ) : (
            <span
              className={`text-base font-medium leading-snug block truncate transition-colors duration-300 ${
                isCompleted || justCompleted ? 'line-through text-forge-500' : 'text-forge-100'
              }`}
            >
              {task.title}
            </span>
          )}

          {task.description && !editing && (
            <span className="text-sm text-forge-500 block truncate mt-0.5">
              {task.description}
            </span>
          )}
        </div>

        {/* Meta + actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1 text-xs text-forge-500 mr-1">
            <Clock size={12} />
            {task.estimatedMinutes}m
          </span>

          <span className={`hidden lg:block text-xs font-medium ${config.labelColor} mr-1`}>
            {config.label}
          </span>

          {!isCompleted && !isFocused && (
            <motion.button
              onClick={() => setFocus(task.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              transition={{ duration: 0.12, ease: easeOutExpo }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-heading font-semibold text-ember bg-ember/10 rounded-md hover:bg-ember/20 transition-colors duration-150 max-md:opacity-100 opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Focus on this task"
            >
              <Crosshair size={13} />
              <span className="hidden sm:inline">Focus</span>
            </motion.button>
          )}

          {isFocused && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: easeOutExpo }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-heading font-semibold text-ember bg-ember/10 rounded-md"
            >
              <Crosshair size={13} />
              Active
            </motion.span>
          )}

          {!isCompleted && !editing && (
            <button
              onClick={() => {
                setEditTitle(task.title)
                setEditing(true)
              }}
              className="p-1.5 text-forge-600 hover:text-forge-300 rounded-md hover:bg-forge-750 max-md:opacity-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
              aria-label="Edit task"
            >
              <Pencil size={14} />
            </button>
          )}

          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 text-forge-600 hover:text-heat rounded-md hover:bg-heat/10 max-md:opacity-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
            aria-label="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

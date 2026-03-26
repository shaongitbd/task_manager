import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTaskStore } from '@/stores/taskStore'
import { TaskItem } from './TaskItem'
import { AddTaskForm } from './AddTaskForm'
import { ParkingLot } from './ParkingLot'
import type { Priority } from '@/types/task'

const filterOptions: { value: Priority | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
]

const priorityOrder: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
}

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks)
  const settings = useTaskStore((s) => s.settings)
  const clearCompleted = useTaskStore((s) => s.clearCompleted)
  const [filter, setFilter] = useState<Priority | 'all'>('all')

  const { activeTasks, completedTasks } = useMemo(() => {
    const filtered = filter === 'all'
      ? tasks
      : tasks.filter((t) => t.priority === filter)

    const active = filtered
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.order - b.order)

    const completed = filtered
      .filter((t) => t.status === 'completed')
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())

    return { activeTasks: active, completedTasks: completed }
  }, [tasks, filter])

  return (
    <section className="px-6 py-6 md:px-10">
      <AddTaskForm />

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                filter === opt.value
                  ? 'bg-forge-750 text-forge-100'
                  : 'text-forge-500 hover:text-forge-300 hover:bg-forge-850'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-forge-600">
          {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Active tasks */}
      <div className="flex flex-col gap-1">
        <AnimatePresence mode="popLayout">
          {activeTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </AnimatePresence>
      </div>

      {activeTasks.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-forge-500 text-lg font-heading">
            {filter !== 'all' ? 'No tasks with this priority' : 'No tasks yet'}
          </p>
          <p className="text-forge-600 text-sm mt-1">
            {filter !== 'all'
              ? 'Try a different filter or add new tasks'
              : 'Add your first task above to get started'}
          </p>
        </div>
      )}

      {/* Completed tasks */}
      {settings.showCompletedTasks && completedTasks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-forge-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-heading font-semibold tracking-widest uppercase text-forge-600">
              Completed ({completedTasks.length})
            </span>
            <button
              onClick={clearCompleted}
              className="text-xs text-forge-600 hover:text-heat transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <AnimatePresence>
              {completedTasks.slice(0, 10).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {!settings.showCompletedTasks && completedTasks.length > 0 && (
        <button
          onClick={() => useTaskStore.getState().updateSettings({ showCompletedTasks: true })}
          className="mt-4 text-xs text-forge-600 hover:text-forge-400 transition-colors"
        >
          Show {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''}
        </button>
      )}

      {/* Parking Lot */}
      <ParkingLot />
    </section>
  )
}

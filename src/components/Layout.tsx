import { motion } from 'framer-motion'
import { ListTodo, Settings, BarChart3, Flame, CalendarDays, Target } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'
import { CurrentFocus } from './CurrentFocus'
import { TaskList } from './TaskList'
import { WeeklyPlanner } from './WeeklyPlanner'
import { GoalsPanel } from './GoalsPanel'
import { SettingsPanel } from './SettingsPanel'
import { StatsPanel } from './StatsPanel'

const navItems = [
  { id: 'tasks' as const, icon: ListTodo, label: 'Tasks' },
  { id: 'planner' as const, icon: CalendarDays, label: 'Planner' },
  { id: 'goals' as const, icon: Target, label: 'Goals' },
  { id: 'stats' as const, icon: BarChart3, label: 'Stats' },
  { id: 'settings' as const, icon: Settings, label: 'Settings' },
]

export function Layout() {
  const view = useTaskStore((s) => s.view)
  const setView = useTaskStore((s) => s.setView)
  const focusedTaskId = useTaskStore((s) => s.focusedTaskId)

  return (
    <div className="flex w-full min-h-dvh">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 bottom-0 z-40 flex w-16 flex-col items-center bg-forge-900 border-r border-forge-800 py-6 gap-2 max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:h-16 max-md:flex-row max-md:justify-center max-md:py-0 max-md:border-r-0 max-md:border-t">
        {/* Logo */}
        <div className="mb-8 max-md:hidden">
          <Flame
            size={28}
            className={`transition-colors duration-500 ${
              focusedTaskId ? 'text-ember' : 'text-forge-600'
            }`}
          />
        </div>

        {navItems.map((item) => {
          const isActive = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`relative flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-200 max-md:w-14 max-md:h-11 ${
                isActive
                  ? 'text-ember bg-ember/10'
                  : 'text-forge-500 hover:text-forge-300 hover:bg-forge-800'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-ember rounded-r-full max-md:left-1/2 max-md:-translate-x-1/2 max-md:top-auto max-md:bottom-0 max-md:w-5 max-md:h-[3px] max-md:rounded-t-full max-md:rounded-b-none"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 ml-16 max-md:ml-0 max-md:mb-16">
        <div className={view === 'planner' ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto'}>
          {view === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <CurrentFocus />
              <TaskList />
            </motion.div>
          )}
          {view === 'planner' && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            >
              <WeeklyPlanner />
            </motion.div>
          )}
          {view === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            >
              <GoalsPanel />
            </motion.div>
          )}
          {view === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            >
              <StatsPanel />
            </motion.div>
          )}
          {view === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            >
              <SettingsPanel />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

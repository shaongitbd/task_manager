import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTaskStore } from '@/stores/taskStore'
import { format, isToday, isThisWeek, subDays, isSameDay } from 'date-fns'

const easeOutExpo = [0.16, 1, 0.3, 1] as const

export function StatsPanel() {
  const tasks = useTaskStore((s) => s.tasks)

  const stats = useMemo(() => {
    const now = new Date()

    const completedToday = tasks.filter(
      (t) => t.completedAt && isToday(new Date(t.completedAt))
    )
    const completedThisWeek = tasks.filter(
      (t) => t.completedAt && isThisWeek(new Date(t.completedAt), { weekStartsOn: 1 })
    )
    const focusTimeToday = tasks
      .filter((t) => t.focusedAt && isToday(new Date(t.focusedAt)))
      .reduce((sum, t) => sum + t.elapsedSeconds, 0)

    const totalCompleted = tasks.filter((t) => t.status === 'completed').length
    const totalFocusTime = tasks.reduce((sum, t) => sum + t.elapsedSeconds, 0)

    let streak = 0
    let checkDate = now
    for (let i = 0; i < 365; i++) {
      const dayCompleted = tasks.some(
        (t) => t.completedAt && isSameDay(new Date(t.completedAt), checkDate)
      )
      if (dayCompleted) {
        streak++
        checkDate = subDays(checkDate, 1)
      } else if (i === 0) {
        checkDate = subDays(checkDate, 1)
      } else {
        break
      }
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i)
      const completed = tasks.filter(
        (t) => t.completedAt && isSameDay(new Date(t.completedAt), date)
      ).length
      return { date, completed, label: format(date, 'EEE'), fullLabel: format(date, 'MMM d') }
    })

    const maxDaily = Math.max(...last7Days.map((d) => d.completed), 1)

    return {
      completedToday: completedToday.length,
      completedThisWeek: completedThisWeek.length,
      focusTimeToday,
      totalCompleted,
      totalFocusTime,
      streak,
      last7Days,
      maxDaily,
    }
  }, [tasks])

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-12 max-w-3xl">
      <h1
        className="font-heading font-bold text-forge-100 mb-1"
        style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
      >
        Your Progress
      </h1>
      <p className="text-forge-500 text-sm mb-10">
        {format(new Date(), 'EEEE, MMMM d')}
      </p>

      {/* Today's snapshot — NOT a card grid. Inline text layout. */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOutExpo }}
        className="mb-12"
      >
        <div className="flex items-baseline gap-3 mb-6">
          <span
            className="font-heading font-bold text-forge-50 tabular-nums"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
          >
            {stats.completedToday}
          </span>
          <span className="text-forge-400 text-lg font-heading">
            task{stats.completedToday !== 1 ? 's' : ''} done today
          </span>
        </div>

        <div className="flex gap-8 flex-wrap text-sm mb-2">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-ember text-xl tabular-nums">
              {formatDuration(stats.focusTimeToday)}
            </span>
            <span className="text-forge-500">focused</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-forge-200 text-xl tabular-nums">
              {stats.completedThisWeek}
            </span>
            <span className="text-forge-500">this week</span>
          </div>
          {stats.streak > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-bold text-heat text-xl tabular-nums">
                {stats.streak}
              </span>
              <span className="text-forge-500">day streak</span>
            </div>
          )}
        </div>
      </motion.section>

      {/* 7-day activity — horizontal bars, not vertical chart */}
      <section className="mb-12">
        <h2 className="font-heading font-semibold text-forge-400 text-xs tracking-widest uppercase mb-5">
          Last 7 days
        </h2>
        <div className="space-y-2">
          {stats.last7Days.map((day, i) => {
            const width = (day.completed / stats.maxDaily) * 100
            const today = i === 6
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: easeOutExpo }}
                className="flex items-center gap-3"
              >
                <span className={`w-10 text-xs font-heading tabular-nums text-right flex-shrink-0 ${
                  today ? 'text-ember font-bold' : 'text-forge-500'
                }`}>
                  {day.label}
                </span>
                <div className="flex-1 h-5 bg-forge-850 rounded-sm overflow-hidden">
                  {day.completed > 0 && (
                    <motion.div
                      className="h-full rounded-sm"
                      style={{ background: today ? '#e8930a' : '#443e35' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(width, 6)}%` }}
                      transition={{ duration: 0.5, delay: 0.15 + i * 0.04, ease: easeOutExpo }}
                    />
                  )}
                </div>
                <span className={`w-5 text-xs tabular-nums text-right flex-shrink-0 ${
                  today ? 'text-ember font-semibold' : 'text-forge-600'
                }`}>
                  {day.completed || ''}
                </span>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* All-time — simple inline, no cards */}
      <section>
        <h2 className="font-heading font-semibold text-forge-400 text-xs tracking-widest uppercase mb-4">
          All time
        </h2>
        <div className="flex gap-8 flex-wrap text-sm">
          <div>
            <span className="text-forge-500">Completed</span>{' '}
            <span className="text-forge-200 font-heading font-semibold">{stats.totalCompleted}</span>
          </div>
          <div>
            <span className="text-forge-500">Focused</span>{' '}
            <span className="text-forge-200 font-heading font-semibold">{formatDuration(stats.totalFocusTime)}</span>
          </div>
        </div>
      </section>
    </div>
  )
}

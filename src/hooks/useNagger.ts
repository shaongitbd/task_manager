import { useEffect, useRef, useState } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { sendDesktopNotification } from '../lib/notifications'
import { playNagSound } from '../lib/sounds'
import { isMobile, scheduleNagNotification, cancelNagNotification, setupMobileNotifications } from '../lib/mobile-notifications'

export function useNagger() {
  const {
    focusedTaskId,
    tasks,
    settings,
    nagDismissedAt,
    tickFocusTimer,
  } = useTaskStore()

  const [showNagOverlay, setShowNagOverlay] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nagRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const focusedTask = tasks.find((t) => t.id === focusedTaskId)

  // Set up mobile notifications on mount
  useEffect(() => {
    if (isMobile()) {
      setupMobileNotifications()
    }
  }, [])

  // Schedule mobile nag notifications when focus changes
  useEffect(() => {
    if (!isMobile()) return
    if (focusedTask && settings.notificationsEnabled) {
      scheduleNagNotification(focusedTask.title, settings.nagIntervalMinutes)
    } else if (!focusedTaskId && tasks.filter(t => t.status !== 'completed').length > 0 && settings.notificationsEnabled) {
      scheduleNagNotification('', settings.nagIntervalMinutes)
    } else {
      cancelNagNotification()
    }
  }, [focusedTaskId, focusedTask, settings.nagIntervalMinutes, settings.notificationsEnabled, tasks])

  // Tick the focus timer every second
  useEffect(() => {
    if (focusedTaskId) {
      timerRef.current = setInterval(tickFocusTimer, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [focusedTaskId, tickFocusTimer])

  // Nag system
  useEffect(() => {
    if (!focusedTaskId || !settings.notificationsEnabled) {
      setShowNagOverlay(false)
      return
    }

    const intervalMs = settings.nagIntervalMinutes * 60 * 1000

    nagRef.current = setInterval(() => {
      const now = Date.now()
      const lastDismissed = nagDismissedAt || 0

      if (now - lastDismissed >= intervalMs) {
        setShowNagOverlay(true)

        if (settings.soundEnabled) {
          playNagSound(settings.nagStyle)
        }

        if (focusedTask) {
          sendDesktopNotification(
            getNagTitle(settings.nagStyle),
            `You should be working on: ${focusedTask.title}`,
            true
          )
        }
      }
    }, Math.min(intervalMs, 10000)) // Check every 10s or at interval

    return () => {
      if (nagRef.current) clearInterval(nagRef.current)
    }
  }, [focusedTaskId, settings, nagDismissedAt, focusedTask])

  // Also nag when there's NO focused task but there ARE pending tasks
  useEffect(() => {
    if (focusedTaskId) return
    const pendingTasks = tasks.filter((t) => t.status !== 'completed')
    if (pendingTasks.length === 0) return

    if (!settings.notificationsEnabled) return

    const intervalMs = settings.nagIntervalMinutes * 60 * 1000

    const noFocusNag = setInterval(() => {
      const now = Date.now()
      const lastDismissed = nagDismissedAt || 0
      if (now - lastDismissed >= intervalMs) {
        setShowNagOverlay(true)

        if (settings.soundEnabled) {
          playNagSound(settings.nagStyle)
        }

        sendDesktopNotification(
          "You're not focused on anything!",
          `You have ${pendingTasks.length} task${pendingTasks.length > 1 ? 's' : ''} waiting. Pick one and get started!`,
          true
        )
      }
    }, Math.min(intervalMs, 10000))

    return () => clearInterval(noFocusNag)
  }, [focusedTaskId, tasks, settings, nagDismissedAt])

  return {
    showNagOverlay,
    dismissNag: () => {
      setShowNagOverlay(false)
      useTaskStore.getState().dismissNag()
    },
    focusedTask,
  }
}

function getNagTitle(style: 'gentle' | 'firm' | 'aggressive'): string {
  const titles = {
    gentle: [
      'Gentle reminder...',
      'Just checking in!',
      'Hey, how\'s it going?',
    ],
    firm: [
      'Stay focused!',
      'Are you still on track?',
      'Focus check!',
      'Don\'t drift!',
    ],
    aggressive: [
      'HEY! GET BACK TO WORK!',
      'FOCUS! NOW!',
      'STOP PROCRASTINATING!',
      'YOU\'RE LOSING TIME!',
    ],
  }
  const list = titles[style]
  return list[Math.floor(Math.random() * list.length)]
}

import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const NAG_NOTIFICATION_ID = 9999

export function isMobile(): boolean {
  return Capacitor.isNativePlatform()
}

export async function setupMobileNotifications() {
  if (!isMobile()) return

  const permission = await LocalNotifications.requestPermissions()
  if (permission.display !== 'granted') {
    console.warn('Notification permission not granted')
  }
}

export async function scheduleNagNotification(
  taskTitle: string,
  intervalMinutes: number
) {
  if (!isMobile()) return

  // Cancel any existing nag
  await cancelNagNotification()

  // Schedule repeating notification
  await LocalNotifications.schedule({
    notifications: [
      {
        id: NAG_NOTIFICATION_ID,
        title: 'FocusForge — Stay on track!',
        body: taskTitle
          ? `You should be working on: ${taskTitle}`
          : 'You have tasks waiting. Pick one and focus!',
        schedule: {
          every: 'minute',
          count: intervalMinutes,
          allowWhileIdle: true,
        },
        sound: 'default',
        smallIcon: 'ic_stat_icon',
        largeIcon: 'ic_launcher',
        actionTypeId: 'NAG_ACTION',
        extra: { taskTitle },
      },
    ],
  })
}

export async function cancelNagNotification() {
  if (!isMobile()) return

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: NAG_NOTIFICATION_ID }],
    })
  } catch {
    // May fail if no notification exists
  }
}

export async function showImmediateNotification(title: string, body: string) {
  if (!isMobile()) return

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Math.floor(Math.random() * 10000),
        title,
        body,
        schedule: { at: new Date(Date.now() + 100) },
        sound: 'default',
        smallIcon: 'ic_stat_icon',
      },
    ],
  })
}

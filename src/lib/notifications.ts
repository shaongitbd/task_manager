export async function requestNotificationPermission(): Promise<boolean> {
  // Electron handles its own notifications
  if (window.electronAPI?.isElectron) return true
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendDesktopNotification(title: string, body: string, urgent = false) {
  // Use Electron native notifications if available
  if (window.electronAPI?.isElectron) {
    window.electronAPI.showNag(title, body)
    if (urgent) {
      window.electronAPI.bringToFront()
    }
    return
  }

  // Fallback to browser Notification API
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const notification = new Notification(title, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    requireInteraction: urgent,
    tag: 'focusforge-nag',
    silent: false,
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  return notification
}

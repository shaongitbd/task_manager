import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Layout } from './components/Layout'
import { NagOverlay } from './components/NagOverlay'
import { TransitionOverlay } from './components/TransitionOverlay'
import { useNagger } from './hooks/useNagger'
import { useSync } from './hooks/useSync'
import { useTaskStore } from './stores/taskStore'
import { requestNotificationPermission } from './lib/notifications'
import { Toaster } from 'sonner'

export default function App() {
  const { showNagOverlay, dismissNag, focusedTask } = useNagger()
  const showTransition = useTaskStore((s) => s.showTransition)
  useSync()

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <>
      <Layout />
      <AnimatePresence>
        {showTransition && <TransitionOverlay />}
      </AnimatePresence>
      <AnimatePresence>
        {showNagOverlay && !showTransition && (
          <NagOverlay task={focusedTask ?? null} onDismiss={dismissNag} />
        )}
      </AnimatePresence>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-forge-800)',
            color: 'var(--color-forge-200)',
            border: '1px solid var(--color-forge-700)',
            fontFamily: 'var(--font-body)',
          },
        }}
      />
    </>
  )
}

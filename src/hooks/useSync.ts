import { useEffect, useRef } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { initSupabase, syncTasksToCloud, subscribeToChanges } from '../lib/supabase'

export function useSync() {
  const { tasks, settings, importTasks } = useTaskStore()
  const unsubRef = useRef<(() => void) | null>(null)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize Supabase when settings change
  useEffect(() => {
    if (!settings.syncEnabled || !settings.supabaseUrl || !settings.supabaseKey) {
      unsubRef.current?.()
      unsubRef.current = null
      return
    }

    const client = initSupabase(settings.supabaseUrl, settings.supabaseKey)
    if (!client) return

    // Subscribe to real-time changes
    unsubRef.current = subscribeToChanges((remoteTasks) => {
      // Merge: remote tasks win for synced items, local wins for unsynced
      const localUnsynced = tasks.filter((t) => !t.synced)
      const merged = [...remoteTasks]

      for (const local of localUnsynced) {
        const existing = merged.findIndex((t) => t.id === local.id)
        if (existing >= 0) {
          merged[existing] = local
        } else {
          merged.push(local)
        }
      }

      importTasks(merged)
    })

    return () => {
      unsubRef.current?.()
    }
  }, [settings.syncEnabled, settings.supabaseUrl, settings.supabaseKey])

  // Debounced sync when tasks change
  useEffect(() => {
    if (!settings.syncEnabled) return

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = setTimeout(() => {
      const unsynced = tasks.filter((t) => !t.synced)
      if (unsynced.length > 0) {
        syncTasksToCloud(tasks).then((success) => {
          if (success) {
            // Mark all as synced
            const store = useTaskStore.getState()
            store.importTasks(
              store.tasks.map((t) => ({ ...t, synced: true }))
            )
          }
        })
      }
    }, 2000)

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [tasks, settings.syncEnabled])
}

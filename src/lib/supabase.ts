import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import type { Task } from '../types/task'

let supabaseClient: SupabaseClient | null = null
let realtimeChannel: RealtimeChannel | null = null

export function initSupabase(url: string, key: string): SupabaseClient | null {
  if (!url || !key) return null
  try {
    supabaseClient = createClient(url, key)
    return supabaseClient
  } catch {
    return null
  }
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient
}

export async function syncTasksToCloud(tasks: Task[]): Promise<boolean> {
  const client = getSupabase()
  if (!client) return false

  try {
    const { error } = await client
      .from('tasks')
      .upsert(
        tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: t.status,
          estimated_minutes: t.estimatedMinutes,
          elapsed_seconds: t.elapsedSeconds,
          created_at: t.createdAt,
          completed_at: t.completedAt,
          focused_at: t.focusedAt,
          scheduled_date: t.scheduledDate,
          task_order: t.order,
        })),
        { onConflict: 'id' }
      )
    return !error
  } catch {
    return false
  }
}

export async function fetchTasksFromCloud(): Promise<Task[] | null> {
  const client = getSupabase()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .order('task_order', { ascending: true })

    if (error || !data) return null

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      estimatedMinutes: row.estimated_minutes,
      elapsedSeconds: row.elapsed_seconds,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      focusedAt: row.focused_at,
      scheduledDate: row.scheduled_date,
      order: row.task_order,
      synced: true,
    }))
  } catch {
    return null
  }
}

export function subscribeToChanges(
  onUpdate: (tasks: Task[]) => void
): () => void {
  const client = getSupabase()
  if (!client) return () => {}

  realtimeChannel = client
    .channel('tasks-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      async () => {
        const tasks = await fetchTasksFromCloud()
        if (tasks) onUpdate(tasks)
      }
    )
    .subscribe()

  return () => {
    realtimeChannel?.unsubscribe()
    realtimeChannel = null
  }
}

// SQL to create the Supabase table:
// CREATE TABLE tasks (
//   id UUID PRIMARY KEY,
//   title TEXT NOT NULL,
//   description TEXT DEFAULT '',
//   priority TEXT DEFAULT 'normal',
//   status TEXT DEFAULT 'pending',
//   estimated_minutes INTEGER DEFAULT 25,
//   elapsed_seconds INTEGER DEFAULT 0,
//   created_at TIMESTAMPTZ DEFAULT now(),
//   completed_at TIMESTAMPTZ,
//   focused_at TIMESTAMPTZ,
//   scheduled_date DATE,
//   task_order INTEGER DEFAULT 0
// );
// ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

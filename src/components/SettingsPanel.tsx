import { useTaskStore } from '@/stores/taskStore'
import { Bell, Volume2, VolumeX, Cloud, CloudOff, Eye, EyeOff, Timer } from 'lucide-react'

export function SettingsPanel() {
  const settings = useTaskStore((s) => s.settings)
  const updateSettings = useTaskStore((s) => s.updateSettings)

  return (
    <div className="px-6 py-8 md:px-10 md:py-12 max-w-2xl">
      <h1
        className="font-heading font-bold text-forge-100 mb-1"
        style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
      >
        Settings
      </h1>
      <p className="text-forge-500 text-sm mb-10">
        Configure how FocusForge keeps you on track.
      </p>

      {/* Nag Interval */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={16} className="text-ember" />
          <h2 className="font-heading font-semibold text-forge-200 text-base">
            Reminder Interval
          </h2>
        </div>
        <p className="text-forge-500 text-sm mb-4 ml-6">
          How often should I check on you?
        </p>
        <div className="ml-6 flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={settings.nagIntervalMinutes}
            onChange={(e) => updateSettings({ nagIntervalMinutes: Number(e.target.value) })}
            className="flex-1 h-1.5 bg-forge-750 rounded-full appearance-none cursor-pointer accent-ember [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ember [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-ember [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <span className="text-forge-200 font-heading font-semibold text-lg tabular-nums min-w-[3.5rem] text-right">
            {settings.nagIntervalMinutes} min
          </span>
        </div>
      </section>

      {/* Nag Style */}
      <section className="mb-10">
        <h2 className="font-heading font-semibold text-forge-200 text-base mb-1 ml-6">
          Reminder Style
        </h2>
        <p className="text-forge-500 text-sm mb-4 ml-6">
          How intense should the reminders be?
        </p>
        <div className="ml-6 flex gap-2 flex-wrap">
          {([
            { value: 'gentle' as const, label: 'Gentle', desc: 'Soft nudges' },
            { value: 'firm' as const, label: 'Firm', desc: 'Clear reminders' },
            { value: 'aggressive' as const, label: 'Aggressive', desc: 'In your face' },
          ]).map((style) => (
            <button
              key={style.value}
              onClick={() => updateSettings({ nagStyle: style.value })}
              className={`flex flex-col px-4 py-3 rounded-lg border text-left transition-all duration-200 ${
                settings.nagStyle === style.value
                  ? 'border-ember bg-ember/10 text-forge-100'
                  : 'border-forge-750 text-forge-400 hover:border-forge-600 hover:text-forge-300'
              }`}
            >
              <span className="font-heading font-semibold text-sm">{style.label}</span>
              <span className="text-xs mt-0.5 opacity-70">{style.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Pomodoro / Focus Sessions */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Timer size={16} className="text-ember" />
          <h2 className="font-heading font-semibold text-forge-200 text-base">
            Focus Sessions
          </h2>
        </div>
        <p className="text-forge-500 text-sm mb-4 ml-6">
          Work in timed sessions with forced breaks to combat time blindness.
        </p>
        <div className="ml-6 space-y-3">
          <Toggle
            label="Enable focus sessions"
            description="Get a break reminder after each work session"
            enabled={settings.pomodoroEnabled}
            onChange={(v) => updateSettings({ pomodoroEnabled: v })}
            iconOn={<Timer size={16} />}
            iconOff={<Timer size={16} className="opacity-50" />}
          />
          {settings.pomodoroEnabled && (
            <div className="flex items-center gap-6 pt-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-forge-500">Work:</span>
                <select
                  value={settings.workMinutes}
                  onChange={(e) => updateSettings({ workMinutes: Number(e.target.value) })}
                  className="bg-forge-850 border border-forge-750 rounded-md px-2 py-1.5 text-xs text-forge-200 outline-none focus:border-ember/50"
                >
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                  <option value={25}>25 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-forge-500">Break:</span>
                <select
                  value={settings.breakMinutes}
                  onChange={(e) => updateSettings({ breakMinutes: Number(e.target.value) })}
                  className="bg-forge-850 border border-forge-750 rounded-md px-2 py-1.5 text-xs text-forge-200 outline-none focus:border-ember/50"
                >
                  <option value={3}>3 min</option>
                  <option value={5}>5 min</option>
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Toggles */}
      <section className="mb-10 space-y-4 ml-6">
        <Toggle
          label="Sound effects"
          description="Play sounds with reminders and completions"
          enabled={settings.soundEnabled}
          onChange={(v) => updateSettings({ soundEnabled: v })}
          iconOn={<Volume2 size={16} />}
          iconOff={<VolumeX size={16} />}
        />
        <Toggle
          label="Desktop notifications"
          description="Show system notifications (requires permission)"
          enabled={settings.notificationsEnabled}
          onChange={(v) => updateSettings({ notificationsEnabled: v })}
          iconOn={<Bell size={16} />}
          iconOff={<Bell size={16} className="opacity-50" />}
        />
        <Toggle
          label="Show completed tasks"
          description="Display finished tasks in the task list"
          enabled={settings.showCompletedTasks}
          onChange={(v) => updateSettings({ showCompletedTasks: v })}
          iconOn={<Eye size={16} />}
          iconOff={<EyeOff size={16} />}
        />
      </section>

      {/* Sync */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          {settings.syncEnabled ? (
            <Cloud size={16} className="text-steel" />
          ) : (
            <CloudOff size={16} className="text-forge-600" />
          )}
          <h2 className="font-heading font-semibold text-forge-200 text-base">
            Cloud Sync
          </h2>
        </div>
        <p className="text-forge-500 text-sm mb-4 ml-6">
          Sync tasks across devices via Supabase. Free at{' '}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-steel hover:underline"
          >
            supabase.com
          </a>
        </p>

        <div className="ml-6 space-y-3">
          <Toggle
            label="Enable sync"
            description="Connect to Supabase for cross-device sync"
            enabled={settings.syncEnabled}
            onChange={(v) => updateSettings({ syncEnabled: v })}
            iconOn={<Cloud size={16} />}
            iconOff={<CloudOff size={16} />}
          />

          {settings.syncEnabled && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs text-forge-500 mb-1.5">
                  Supabase URL
                </label>
                <input
                  type="url"
                  value={settings.supabaseUrl}
                  onChange={(e) => updateSettings({ supabaseUrl: e.target.value })}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-forge-850 border border-forge-750 rounded-lg px-3 py-2 text-sm text-forge-200 placeholder:text-forge-600 outline-none focus:border-steel/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-forge-500 mb-1.5">
                  Anon Key
                </label>
                <input
                  type="password"
                  value={settings.supabaseKey}
                  onChange={(e) => updateSettings({ supabaseKey: e.target.value })}
                  placeholder="your-anon-key"
                  className="w-full bg-forge-850 border border-forge-750 rounded-lg px-3 py-2 text-sm text-forge-200 placeholder:text-forge-600 outline-none focus:border-steel/50 transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SQL Setup Help */}
      {settings.syncEnabled && (
        <section className="ml-6 mb-10 p-4 bg-forge-850 border border-forge-750 rounded-lg">
          <h3 className="font-heading font-semibold text-forge-300 text-sm mb-2">
            Database Setup
          </h3>
          <p className="text-forge-500 text-xs mb-2">
            Run this SQL in your Supabase SQL Editor:
          </p>
          <pre className="text-xs text-forge-400 bg-forge-900 p-3 rounded overflow-x-auto leading-relaxed">
{`CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  estimated_minutes INT DEFAULT 25,
  elapsed_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  focused_at TIMESTAMPTZ,
  scheduled_date DATE,
  task_order INT DEFAULT 0
);

ALTER TABLE tasks
  ENABLE ROW LEVEL SECURITY;`}
          </pre>
        </section>
      )}
    </div>
  )
}

function Toggle({
  label,
  description,
  enabled,
  onChange,
  iconOn,
  iconOff,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: (value: boolean) => void
  iconOn: React.ReactNode
  iconOff: React.ReactNode
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="flex items-start gap-3 w-full text-left group"
    >
      <div
        className={`relative flex-shrink-0 w-10 h-5.5 rounded-full mt-0.5 transition-colors duration-200 ${
          enabled ? 'bg-ember' : 'bg-forge-700'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-forge-50 shadow-sm transition-transform duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`transition-colors ${enabled ? 'text-forge-200' : 'text-forge-400'}`}>
            {enabled ? iconOn : iconOff}
          </span>
          <span className="text-sm font-medium text-forge-200">{label}</span>
        </div>
        <p className="text-xs text-forge-500 mt-0.5">{description}</p>
      </div>
    </button>
  )
}

import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Avatar from '../components/ui/Avatar'

const AVATAR_COLORS = ['#3454D1', '#0EA5A4', '#E8A93D', '#E1493A', '#6B9E78', '#8B5CF6', '#EC4899']

export default function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color ?? AVATAR_COLORS[0])
  const [saved, setSaved] = useState(false)
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifAssign, setNotifAssign] = useState(true)
  const [notifDue, setNotifDue] = useState(true)

  if (!user) return null

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    await updateProfile({ full_name: fullName.trim() || user!.full_name, avatar_color: avatarColor })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-100">Settings</h1>
        <p className="mt-1 text-sm text-ink-400">Manage your profile, appearance, and notifications</p>
      </div>

      <section className="card p-5">
        <h2 className="mb-4 font-display font-semibold text-ink-900 dark:text-ink-100">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={fullName || user.full_name} color={avatarColor} size="lg" />
            <div className="flex gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setAvatarColor(c)}
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: c, boxShadow: avatarColor === c ? `0 0 0 2px ${c}` : 'none' }}
                  aria-label={`Choose color ${c}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="full-name">Full name</label>
            <input id="full-name" className="field-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" className="field-input opacity-60" value={user.email} disabled />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Save changes</button>
            {saved && <span className="text-sm text-tide-600">Saved ✓</span>}
          </div>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-display font-semibold text-ink-900 dark:text-ink-100">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-800 dark:text-ink-100">Theme</p>
            <p className="text-xs text-ink-400">Switch between light and dark mode</p>
          </div>
          <button className="btn-secondary" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-display font-semibold text-ink-900 dark:text-ink-100">Notifications</h2>
        <div className="space-y-3">
          <ToggleRow label="Email notifications" description="Receive a summary of activity by email" checked={notifEmail} onChange={setNotifEmail} />
          <ToggleRow label="Task assignments" description="Notify me when I'm assigned a task" checked={notifAssign} onChange={setNotifAssign} />
          <ToggleRow label="Due date reminders" description="Notify me when a task is due soon" checked={notifDue} onChange={setNotifDue} />
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-display font-semibold text-ink-900 dark:text-ink-100">Account</h2>
        <button className="btn-danger" onClick={signOut}>Log out</button>
      </section>
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{label}</p>
        <p className="text-xs text-ink-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-flow-500' : 'bg-ink-200 dark:bg-ink-700'}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

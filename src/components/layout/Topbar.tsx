import { useEffect, useRef, useState } from 'react'
import { Menu, Moon, Sun, Bell, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Avatar from '../ui/Avatar'
import { listNotifications, markNotificationRead } from '../../lib/db'
import type { Notification } from '../../types'
import { formatRelativeTime, classNames } from '../../lib/utils'

export default function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) listNotifications(user.id).then(setNotifs)
  }, [user])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = notifs.filter((n) => !n.read).length

  async function handleReadAll() {
    if (!user) return
    await Promise.all(notifs.filter((n) => !n.read).map((n) => markNotificationRead(user.id, n.id)))
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-100 dark:border-ink-800 bg-surface/90 dark:bg-ink-900/90 backdrop-blur px-4 py-3 lg:px-6">
      <button className="btn-ghost !p-2 lg:hidden" onClick={onOpenMobile} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <button className="btn-ghost !p-2" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button className="btn-ghost relative !p-2" onClick={() => setNotifOpen((v) => !v)} aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-coral" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 card p-2 max-h-96 overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Notifications</p>
                {unread > 0 && (
                  <button onClick={handleReadAll} className="text-xs font-medium text-flow-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              {notifs.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-ink-400">You're all caught up.</p>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    className={classNames(
                      'rounded-lg px-2.5 py-2.5 text-sm',
                      !n.read && 'bg-flow-50 dark:bg-flow-500/10'
                    )}
                  >
                    <p className="text-ink-700 dark:text-ink-200">{n.message}</p>
                    <p className="mt-0.5 text-xs text-ink-400">{formatRelativeTime(n.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-ink-100 dark:hover:bg-ink-800"
            onClick={() => setUserOpen((v) => !v)}
          >
            <Avatar name={user.full_name} color={user.avatar_color} size="sm" />
          </button>
          {userOpen && (
            <div className="absolute right-0 mt-2 w-48 card p-1.5">
              <p className="px-2.5 py-2 text-sm font-semibold text-ink-800 dark:text-ink-100 truncate">{user.full_name}</p>
              <p className="px-2.5 pb-2 -mt-1.5 text-xs text-ink-400 truncate">{user.email}</p>
              <button
                onClick={() => {
                  setUserOpen(false)
                  navigate('/settings')
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                <SettingsIcon className="h-4 w-4" /> Settings
              </button>
              <button
                onClick={async () => {
                  await signOut()
                  navigate('/login')
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-coral hover:bg-coral/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

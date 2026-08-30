import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Waves,
  X,
} from 'lucide-react'
import { classNames } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink-100 dark:border-ink-800 bg-surface dark:bg-ink-900 transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-flow-500 text-white">
              <Waves className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-base font-semibold leading-tight text-ink-900 dark:text-ink-100">FlowDesk</p>
              <p className="text-[10px] font-mono uppercase tracking-wide text-ink-400">without the chaos</p>
            </div>
          </div>
          <button className="btn-ghost !p-1.5 lg:hidden" onClick={onCloseMobile} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-flow-50 text-flow-600 dark:bg-flow-500/10 dark:text-flow-400'
                    : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mx-3 mb-4 rounded-xl2 bg-tide-50 dark:bg-tide-500/10 p-4">
          <p className="text-xs font-semibold text-tide-600 dark:text-tide-400">Connected to Supabase</p>
          <p className="mt-1 text-[11px] leading-snug text-ink-400">
            Your data is stored for real — sign up from another device and it'll be there.
          </p>
        </div>
      </aside>
    </>
  )
}

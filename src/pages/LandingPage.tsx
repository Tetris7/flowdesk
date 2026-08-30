import { Link } from 'react-router-dom'
import { Waves, ArrowRight, Columns3, BarChart3, Users, Calendar, CheckCircle2 } from 'lucide-react'

const COLUMNS = [
  { label: 'To Do', color: '#C7C9D4', cards: ['Design onboarding flow', 'Draft Q3 roadmap'] },
  { label: 'In Progress', color: '#3454D1', cards: ['Build responsive navbar', 'Fix checkout bug'] },
  { label: 'Review', color: '#E8A93D', cards: ['Homepage copy pass'] },
  { label: 'Completed', color: '#0EA5A4', cards: ['Ship v2.1', 'Migrate analytics'] },
]

const FEATURES = [
  { icon: Columns3, title: 'Kanban that keeps up', desc: 'Drag tasks across To Do, In Progress, Review, and Completed — built for how work actually moves.' },
  { icon: BarChart3, title: 'Analytics that mean something', desc: 'Real completion trends and workload data pulled straight from your projects, not decorative charts.' },
  { icon: Users, title: 'Team clarity', desc: 'See who owns what, who is overloaded, and who has room — at a glance.' },
  { icon: Calendar, title: 'Deadlines you can see coming', desc: 'Every due date lives on one calendar, so nothing slips through.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-flow-500 text-white">
            <Waves className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100">FlowDesk</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">Log in</Link>
          <Link to="/signup" className="btn-primary">Get started</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink-900 dark:text-ink-100 lg:text-5xl">
            Project management,<br /> without the chaos.
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-500 dark:text-ink-400">
            FlowDesk brings your projects, tasks, deadlines, and team into one calm, organized view — so nothing gets lost between tools.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link to="/signup" className="btn-primary !px-6 !py-3">
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary !px-6 !py-3">Log in</Link>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto rounded-xl2 border border-ink-100 dark:border-ink-800 bg-surface dark:bg-ink-900 p-4 shadow-soft">
          {COLUMNS.map((col) => (
            <div key={col.label} className="w-40 flex-shrink-0">
              <div className="mb-2 flex items-center gap-1.5 px-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-xs font-semibold text-ink-500 dark:text-ink-400">{col.label}</span>
              </div>
              <div className="space-y-2">
                {col.cards.map((c) => (
                  <div key={c} className="rounded-lg border border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-800 px-2.5 py-2 text-[11px] leading-snug text-ink-700 dark:text-ink-200">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-flow-50 dark:bg-flow-500/10 text-flow-600 dark:text-flow-400">
                <f.icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-3 font-display font-semibold text-ink-900 dark:text-ink-100">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-tide-500" />
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink-900 dark:text-ink-100">Bring your team's work into one place.</h2>
        <p className="mt-2 text-sm text-ink-400">Free to start. No credit card required.</p>
        <Link to="/signup" className="btn-primary mt-6 inline-flex !px-6 !py-3">
          Create your workspace <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-ink-100 dark:border-ink-800 py-8 text-center text-xs text-ink-400">
        FlowDesk — Project management, without the chaos.
      </footer>
    </div>
  )
}

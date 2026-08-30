import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper dark:bg-ink-950 px-4 text-center">
      <p className="font-mono text-sm text-ink-400">404</p>
      <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-100">Page not found</h1>
      <p className="text-sm text-ink-400">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">Back home</Link>
    </div>
  )
}

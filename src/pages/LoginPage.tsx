import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Waves } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper dark:bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-flow-500 text-white">
            <Waves className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-xl font-semibold text-ink-900 dark:text-ink-100">FlowDesk</span>
        </Link>

        <div className="card p-6">
          <h1 className="mb-1 font-display text-xl font-semibold text-ink-900 dark:text-ink-100">Welcome back</h1>
          <p className="mb-6 text-sm text-ink-400">Log in to pick up where you left off.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input id="password" type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-coral">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-ink-400">
          Don't have an account? <Link to="/signup" className="font-medium text-flow-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

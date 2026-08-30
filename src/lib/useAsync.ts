import { useCallback, useEffect, useState } from 'react'

export type AsyncStatus = 'loading' | 'success' | 'error'

export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<Error | null>(null)
  const [tick, setTick] = useState(0)

  const run = useCallback(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)
    fetcher()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error('Something went wrong'))
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => run(), [...deps, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, status, error, retry: () => setTick((t) => t + 1), setData }
}

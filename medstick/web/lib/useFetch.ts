'use client'
import { useEffect, useRef, useState } from 'react'

export function useFetch<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    setLoading(true)
    setError(null)
    loader()
      .then((r) => {
        if (!cancelled.current) setData(r)
      })
      .catch((e) => {
        if (!cancelled.current) setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled.current) setLoading(false)
      })
    return () => {
      cancelled.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, error, loading, refetch: () => setTick((t) => t + 1) }
}

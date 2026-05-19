'use client'
import { useEffect, useState } from 'react'

type Status = 'loading' | 'ok' | 'error'

export default function ClaudeStatus() {
  const [status, setStatus] = useState<Status>('loading')
  const [model, setModel] = useState('')

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => { if (d.ok) { setStatus('ok'); setModel(d.model ?? '') } else setStatus('error') })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') {
    return (
      <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse inline-block" />
        AI...
      </span>
    )
  }

  if (status === 'ok') {
    return (
      <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
        <span className="hidden sm:inline">{model || 'Claude'}</span>
        <span className="sm:hidden">Claude</span>
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-red-300">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block shrink-0" />
      ไม่ได้เชื่อมต่อ
    </span>
  )
}

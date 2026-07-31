import type { ReactNode } from 'react'

export default function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      {children}
    </div>
  )
}

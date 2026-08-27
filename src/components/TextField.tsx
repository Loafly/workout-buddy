import type { ReactNode } from 'react'
import { DraftInput, DraftTextArea } from './ui'

export const TextField = DraftInput
export const TextArea = DraftTextArea

export function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-300">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-600">{hint}</p>}
      </div>
      <div className="w-32 shrink-0">{children}</div>
    </div>
  )
}

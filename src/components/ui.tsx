import { useEffect, useState, type ReactNode } from 'react'

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={`w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left ${className}`}
    >
      {children}
    </Tag>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mt-6 mb-2 flex items-baseline justify-between px-1">
      <h2 className="text-sm font-semibold text-slate-300">{children}</h2>
      {right && <span className="text-xs text-slate-500">{right}</span>}
    </div>
  )
}

export function Pill({
  children,
  tone = 'slate',
}: {
  children: ReactNode
  tone?: 'slate' | 'sky' | 'amber' | 'rose' | 'emerald'
}) {
  const tones = {
    slate: 'bg-slate-800 text-slate-300',
    sky: 'bg-sky-500/15 text-sky-300',
    amber: 'bg-amber-500/15 text-amber-300',
    rose: 'bg-rose-500/15 text-rose-300',
    emerald: 'bg-emerald-500/15 text-emerald-300',
  }
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  className?: string
  disabled?: boolean
}) {
  const variants = {
    primary: 'bg-sky-500 text-slate-950 font-semibold active:bg-sky-400',
    ghost: 'border border-slate-700 bg-slate-900 text-slate-200 active:bg-slate-800',
    danger: 'border border-rose-900 bg-rose-950/40 text-rose-300 active:bg-rose-950',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-3 text-sm transition-colors disabled:opacity-40 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * 입력값을 로컬 state로 들고 있다가 커밋합니다.
 * 저장이 IndexedDB를 왕복하는 동안 재렌더가 입력 중인 글자를 덮어쓰는 것을 막습니다.
 */
function useDraft(value: string) {
  const [text, setText] = useState(value)
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    if (!focused) setText(value)
  }, [value, focused])
  return { text, setText, onFocus: () => setFocused(true), onBlur: () => setFocused(false) }
}

export function NumberField({
  value,
  onChange,
  placeholder,
  suffix,
  step = 1,
  className = '',
}: {
  value: number | null | undefined
  onChange: (v: number | null) => void
  placeholder?: string
  suffix?: string
  step?: number
  className?: string
}) {
  const draft = useDraft(value == null ? '' : String(value))

  return (
    <label className={`relative flex items-center ${className}`}>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={draft.text}
        placeholder={placeholder}
        onFocus={draft.onFocus}
        onBlur={draft.onBlur}
        onChange={(e) => {
          const t = e.target.value
          draft.setText(t)
          if (t === '') onChange(null)
          else if (!Number.isNaN(Number(t))) onChange(Number(t))
        }}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pr-7 pl-2.5 text-sm tabular-nums text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
      />
      {suffix && (
        <span className="pointer-events-none absolute right-2 text-[11px] text-slate-500">
          {suffix}
        </span>
      )}
    </label>
  )
}

export function DraftInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  const draft = useDraft(value)
  return (
    <input
      value={draft.text}
      placeholder={placeholder}
      onFocus={draft.onFocus}
      onBlur={draft.onBlur}
      onChange={(e) => {
        draft.setText(e.target.value)
        onChange(e.target.value)
      }}
      className={`rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none ${className}`}
    />
  )
}

export function DraftTextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  const draft = useDraft(value)
  return (
    <textarea
      value={draft.text}
      placeholder={placeholder}
      rows={rows}
      onFocus={draft.onFocus}
      onBlur={draft.onBlur}
      onChange={(e) => {
        draft.setText(e.target.value)
        onChange(e.target.value)
      }}
      className={`w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none ${className}`}
    />
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
      {children}
    </div>
  )
}

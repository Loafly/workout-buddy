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
      className={`w-full rounded-lg bg-zinc-900/70 p-4 text-left ${onClick ? 'active:bg-zinc-800/70' : ''} ${className}`}
    >
      {children}
    </Tag>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mt-7 mb-2 flex items-baseline justify-between">
      <h2 className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{children}</h2>
      {right && <span className="text-[11px] text-zinc-600">{right}</span>}
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
    slate: 'text-zinc-500',
    sky: 'text-zinc-200',
    amber: 'text-amber-500/90',
    rose: 'text-rose-400/90',
    emerald: 'text-emerald-400/90',
  }
  return <span className={`text-[11px] font-medium ${tones[tone]}`}>{children}</span>
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
    primary: 'bg-zinc-100 text-zinc-950 font-semibold active:bg-zinc-300',
    ghost: 'bg-zinc-900 text-zinc-300 active:bg-zinc-800',
    danger: 'bg-zinc-900 text-rose-400 active:bg-zinc-800',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-3 text-sm transition-colors disabled:opacity-30 ${variants[variant]} ${className}`}
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

const inputBase =
  'w-full rounded-md bg-zinc-950 px-2.5 py-2 text-sm text-zinc-100 outline-none ring-1 ring-zinc-800 placeholder:text-zinc-700 focus:ring-zinc-500'

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
        className={`${inputBase} ${suffix ? 'pr-7' : ''}`}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-2.5 text-[11px] text-zinc-600">
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
      className={`${inputBase} ${className}`}
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
      className={`${inputBase} p-2.5 ${className}`}
    />
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="py-10 text-center text-sm text-zinc-600">{children}</div>
}

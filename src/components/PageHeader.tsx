import type { ReactNode } from 'react'

export default function PageHeader({
  title,
  sub,
  right,
}: {
  title: string
  sub?: string
  right?: ReactNode
}) {
  return (
    <header className="safe-top flex items-baseline justify-between pt-7 pb-5">
      <div>
        <h1 className="text-[26px] leading-none font-semibold tracking-tight text-zinc-50">{title}</h1>
        {sub && <p className="mt-2 text-[13px] text-zinc-500">{sub}</p>}
      </div>
      {right}
    </header>
  )
}

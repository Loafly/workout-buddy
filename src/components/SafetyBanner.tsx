import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Profile } from '../data/profile'

/**
 * 사용자가 프로필에 등록한 안전 수칙.
 * "모든 운동에 적용"되는 제약이므로 운동 화면 최상단에 고정합니다.
 */
export default function SafetyBanner({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  const rules = profile.safetyRules

  if (!rules.length) {
    return (
      <Link to="/settings" className="block py-2 text-xs text-zinc-600 underline underline-offset-4">
        매 운동에 적용할 안전 수칙 등록하기
      </Link>
    )
  }

  return (
    <div className="border-l-2 border-amber-600/70 pl-3">
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left">
        <p className="text-[11px] tracking-wide text-amber-600/90 uppercase">
          {profile.conditionLabel?.trim() || '안전 수칙'}
        </p>
        {open ? (
          <ol className="mt-1.5 space-y-1.5 text-xs text-zinc-400">
            {rules.map((r) => (
              <li key={r.title}>
                <span className="text-zinc-200">{r.title}</span>
                {r.desc && <span className="text-zinc-600"> — {r.desc}</span>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {rules.map((r) => r.title).join(' · ')}
          </p>
        )}
      </button>
    </div>
  )
}

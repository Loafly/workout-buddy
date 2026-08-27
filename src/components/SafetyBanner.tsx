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
      <Link
        to="/settings"
        className="block rounded-2xl border border-dashed border-slate-700 px-4 py-3 text-xs text-slate-500"
      >
        매 운동에 적용할 안전 수칙을 설정에서 등록하면 여기에 항상 표시됩니다.
      </Link>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-900/60 bg-amber-950/25">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-base">⚠️</span>
        <span className="flex-1 text-sm font-medium text-amber-200">
          {profile.conditionLabel?.trim() ? `${profile.conditionLabel.trim()} — 안전 수칙` : '안전 수칙'}
        </span>
        <span className="text-xs text-amber-500/80">{open ? '접기' : '펼치기'}</span>
      </button>
      {open ? (
        <ol className="space-y-2 px-4 pb-4 text-xs text-amber-100/80">
          {rules.map((r, i) => (
            <li key={r.title} className="flex gap-2">
              <span className="text-amber-500/70">{i + 1}.</span>
              <span>
                <b className="text-amber-200">{r.title}</b>
                {r.desc && ` — ${r.desc}`}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="truncate px-4 pb-3 text-xs text-amber-100/70">
          {rules.map((r) => r.title).join(' · ')}
        </p>
      )}
    </div>
  )
}

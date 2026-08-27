import { useState } from 'react'
import { EYE_RULES } from '../data/guide'

/**
 * 망막박리 이력 — 안압 관리 4원칙.
 * 계획서에서 "모든 운동에 적용"이라 명시된 제약이라 운동 화면 최상단에 고정합니다.
 */
export default function EyeRuleBanner() {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-amber-900/60 bg-amber-950/25">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-base">👁</span>
        <span className="flex-1 text-sm font-medium text-amber-200">안압 관리 4원칙</span>
        <span className="text-xs text-amber-500/80">{open ? '접기' : '펼치기'}</span>
      </button>
      {open ? (
        <ol className="space-y-2 px-4 pb-4 text-xs text-amber-100/80">
          {EYE_RULES.map((r, i) => (
            <li key={r.title} className="flex gap-2">
              <span className="text-amber-500/70">{i + 1}.</span>
              <span>
                <b className="text-amber-200">{r.title}</b> — {r.desc}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-4 pb-3 text-xs text-amber-100/70">
          숨 참지 않기 · RPE 7~8 · 8~15회 · 머리 낮추지 않기
        </p>
      )}
    </div>
  )
}

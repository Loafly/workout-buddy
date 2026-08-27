import { useState } from 'react'
import type { Exercise } from '../data/program'
import { repsLabel } from '../data/program'
import type { ExerciseLog, SetLog } from '../db'
import { NumberField, Pill } from './ui'
import { formatShort } from '../lib/date'

interface Props {
  exercise: Exercise
  entry: ExerciseLog
  targetSets: number
  /** 직전 수행 기록 (있으면 회색 힌트로 표시) */
  last: { date: string; sets: SetLog[] } | null
  onChange: (entry: ExerciseLog) => void
}

export default function ExerciseCard({ exercise, entry, targetSets, last, onChange }: Props) {
  const [showCues, setShowCues] = useState(false)
  const doneCount = entry.sets.filter((s) => s.done).length
  const complete = doneCount >= targetSets && targetSets > 0

  const updateSet = (i: number, patch: Partial<SetLog>) => {
    const sets = entry.sets.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    onChange({ ...entry, sets })
  }

  const toggleDone = (i: number) => {
    const s = entry.sets[i]
    // 완료 표시할 때 값이 비어 있으면 직전 기록으로 채워준다
    if (!s.done && s.weight == null && s.reps == null && last) {
      const ref = last.sets[i] ?? last.sets[last.sets.length - 1]
      updateSet(i, { done: true, weight: ref?.weight ?? null, reps: ref?.reps ?? exercise.reps[0] })
      return
    }
    updateSet(i, { done: !s.done, reps: s.reps ?? (s.done ? null : exercise.reps[0]) })
  }

  const addSet = () =>
    onChange({ ...entry, sets: [...entry.sets, { weight: null, reps: null, done: false }] })

  if (targetSets === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="tabular-nums">{exercise.order}</span>
          <span className="line-through">{exercise.name}</span>
          <Pill>40분 컷에서 제외</Pill>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        complete ? 'border-emerald-800/60 bg-emerald-950/15' : 'border-slate-800 bg-slate-900/60'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 w-5 shrink-0 text-sm tabular-nums text-slate-500">
          {exercise.order}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-[15px] font-semibold text-slate-100">{exercise.name}</h3>
            <Pill tone={exercise.fixedBlock ? 'sky' : 'slate'}>{exercise.muscle}</Pill>
            {exercise.fixedBlock && <Pill tone="sky">고정</Pill>}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {targetSets}세트 × {repsLabel(exercise)}
            {last && (
              <span className="ml-2 text-slate-600">
                지난 {formatShort(last.date)}:{' '}
                {last.sets.map((s) => `${s.weight ?? '-'}×${s.reps ?? '-'}`).join(' / ')}
              </span>
            )}
          </p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-slate-500">
          {doneCount}/{targetSets}
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        {entry.sets.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 text-center text-xs tabular-nums text-slate-500">{i + 1}</span>
            <NumberField
              value={s.weight}
              onChange={(v) => updateSet(i, { weight: v })}
              placeholder="중량"
              suffix="kg"
              step={2.5}
              className="flex-1"
            />
            <NumberField
              value={s.reps}
              onChange={(v) => updateSet(i, { reps: v })}
              placeholder="횟수"
              suffix="회"
              className="flex-1"
            />
            <button
              onClick={() => toggleDone(i)}
              aria-label={`${i + 1}세트 완료`}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm transition-colors ${
                s.done
                  ? 'border-emerald-600 bg-emerald-600 text-slate-950'
                  : 'border-slate-700 bg-slate-950 text-slate-600'
              }`}
            >
              ✓
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs">
        <button onClick={addSet} className="text-slate-500 active:text-slate-300">
          + 세트 추가
        </button>
        {exercise.cues && (
          <button
            onClick={() => setShowCues((v) => !v)}
            className="ml-auto text-sky-500/80 active:text-sky-400"
          >
            {showCues ? '큐 접기' : '자세 큐'}
          </button>
        )}
      </div>

      {showCues && exercise.cues && (
        <ul className="mt-2 space-y-1 rounded-xl bg-slate-950/60 p-3 text-xs text-slate-400">
          {exercise.cues.map((c) => (
            <li key={c} className="flex gap-1.5">
              <span className="text-sky-600">·</span>
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

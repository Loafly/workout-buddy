import { useState } from 'react'
import type { Exercise } from '../data/program'
import { repsLabel } from '../data/program'
import type { ExerciseLog, SetLog } from '../db'
import { NumberField } from './ui'
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
      <div className="flex items-baseline gap-2 border-t border-zinc-900 py-3 text-sm text-zinc-700">
        <span className="w-4 tabular-nums">{exercise.order}</span>
        <span className="line-through">{exercise.name}</span>
        <span className="ml-auto text-[11px]">제외</span>
      </div>
    )
  }

  return (
    <section className="border-t border-zinc-900 py-4">
      <div className="flex items-baseline gap-2">
        <span className="w-4 shrink-0 text-sm tabular-nums text-zinc-700">{exercise.order}</span>
        <div className="min-w-0 flex-1">
          <h3
            className={`text-[15px] font-medium ${complete ? 'text-zinc-500' : 'text-zinc-100'}`}
          >
            {exercise.name}
          </h3>
          <p className="mt-0.5 text-xs text-zinc-600">
            {exercise.muscle} · {targetSets}세트 × {repsLabel(exercise)}
            {last && (
              <>
                {' · '}
                {formatShort(last.date)}{' '}
                {last.sets.map((s) => `${s.weight ?? '-'}×${s.reps ?? '-'}`).join(' ')}
              </>
            )}
          </p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-zinc-600">
          {doneCount}/{targetSets}
        </span>
      </div>

      <div className="mt-3 ml-6 space-y-1.5">
        {entry.sets.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-3 text-[11px] tabular-nums text-zinc-700">{i + 1}</span>
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
              className={`h-9 w-9 shrink-0 rounded-md text-sm transition-colors ${
                s.done ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-zinc-700'
              }`}
            >
              ✓
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 ml-6 flex items-center gap-4 text-[11px] text-zinc-600">
        <button onClick={addSet} className="active:text-zinc-300">
          세트 추가
        </button>
        {exercise.cues && (
          <button onClick={() => setShowCues((v) => !v)} className="ml-auto active:text-zinc-300">
            {showCues ? '큐 접기' : '자세 큐'}
          </button>
        )}
      </div>

      {showCues && exercise.cues && (
        <ul className="mt-2 ml-6 space-y-1 text-xs text-zinc-500">
          {exercise.cues.map((c) => (
            <li key={c}>— {c}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

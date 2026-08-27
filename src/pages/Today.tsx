import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import PageHeader from '../components/PageHeader'
import SafetyBanner from '../components/SafetyBanner'
import ExerciseCard from '../components/ExerciseCard'
import { Button, Card, DraftTextArea, NumberField, Pill, SectionTitle } from '../components/ui'
import { SESSIONS, setsForMode, type SessionType } from '../data/program'
import { CARDIO } from '../data/guide'
import { useProfile } from '../hooks/useProfile'
import { db, type ExerciseLog, type SetLog, type WorkoutSession } from '../db'
import { formatKo, toDateKey, weekStart } from '../lib/date'
import { lastPerformance } from '../lib/stats'

const emptySets = (n: number): SetLog[] =>
  Array.from({ length: n }, () => ({ weight: null, reps: null, done: false }))

const hasData = (s: SetLog) => s.done || s.weight != null || s.reps != null

/**
 * 40분 컷을 켜고 끌 때 세트 행 수를 맞춥니다.
 * 이미 입력한 세트는 목표 세트 수보다 많아도 잘라내지 않습니다.
 */
function resizeSets(sets: SetLog[], target: number): SetLog[] {
  if (target === 0) return sets
  const lastFilled = sets.reduce((n, s, i) => (hasData(s) ? i + 1 : n), 0)
  const keep = Math.max(target, lastFilled)
  return keep <= sets.length ? sets.slice(0, keep) : [...sets, ...emptySets(keep - sets.length)]
}

export default function Today() {
  const today = toDateKey()
  const [short, setShort] = useState(false)
  const [pickedType, setPickedType] = useState<SessionType | null>(null)

  const { profile } = useProfile()
  const sessions = useLiveQuery(() => db.sessions.toArray(), [], [] as WorkoutSession[])
  const daily = useLiveQuery(() => db.daily.get(today), [today])

  const todaySession = sessions.find((s) => s.date === today)
  const past = sessions.filter((s) => s.date !== today).sort((a, b) => b.date.localeCompare(a.date))
  const lastType = past[0]?.type
  /** A → B → A → B 교대. 기록이 없으면 A부터 */
  const nextType: SessionType = pickedType ?? (lastType === 'A' ? 'B' : 'A')
  const thisWeekCount = sessions.filter((s) => weekStart(s.date) === weekStart(today)).length

  const start = async (type: SessionType, shortMode: boolean) => {
    const entries: ExerciseLog[] = SESSIONS[type].exercises.map((ex) => {
      const n = setsForMode(ex, shortMode)
      return { exerciseId: ex.id, sets: emptySets(n || ex.sets), skipped: n === 0 }
    })
    await db.sessions.add({
      date: today,
      type,
      short: shortMode,
      entries,
      startedAt: Date.now(),
    })
  }

  const updateEntry = async (entry: ExerciseLog) => {
    if (!todaySession?.id) return
    await db.sessions.update(todaySession.id, {
      entries: todaySession.entries.map((e) => (e.exerciseId === entry.exerciseId ? entry : e)),
    })
  }

  const toggleShortMode = async () => {
    if (!todaySession?.id) return
    const next = !todaySession.short
    await db.sessions.update(todaySession.id, {
      short: next,
      entries: todaySession.entries.map((e) => {
        const ex = SESSIONS[todaySession.type].exercises.find((x) => x.id === e.exerciseId)!
        return { ...e, sets: resizeSets(e.sets, setsForMode(ex, next)), skipped: setsForMode(ex, next) === 0 }
      }),
    })
  }

  const finish = async () => {
    if (!todaySession?.id) return
    await db.sessions.update(todaySession.id, { finishedAt: Date.now() })
  }

  const saveSteps = (steps: number | null) =>
    db.daily.put({ ...(daily ?? { date: today }), date: today, steps: steps ?? undefined })

  /* ---------- 운동 시작 전 ---------- */
  if (!todaySession) {
    return (
      <>
        <PageHeader
          title="오늘"
          sub={formatKo(today)}
          right={
            <Pill tone={thisWeekCount >= profile.weeklySessions ? 'emerald' : 'slate'}>
              이번 주 {thisWeekCount}/{profile.weeklySessions}
            </Pill>
          }
        />
        <SafetyBanner profile={profile} />

        <SectionTitle right="A → B → A → B 교대">오늘 세션</SectionTitle>
        <div className="flex gap-2">
          {(['A', 'B'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setPickedType(t)}
              className={`flex-1 rounded-lg border p-4 text-left transition-colors ${
                nextType === t
                  ? 'border-zinc-500 bg-zinc-800/60'
                  : 'border-zinc-800 bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-zinc-100">세션 {t}</span>
                {nextType === t && !pickedType && <Pill tone="sky">추천</Pill>}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {SESSIONS[t].exercises
                  .slice(0, 3)
                  .map((e) => e.name)
                  .join(' · ')}{' '}
                …
              </p>
            </button>
          ))}
        </div>

        <label className="mt-3 flex items-center gap-3 rounded-lg bg-zinc-900/70 px-4 py-3">
          <input
            type="checkbox"
            checked={short}
            onChange={(e) => setShort(e.target.checked)}
            className="h-4 w-4 accent-zinc-300"
          />
          <span className="flex-1 text-sm text-zinc-200">40분 컷</span>
          <span className="text-xs text-zinc-500">4·5번 제외, 고정 블록 2세트</span>
        </label>

        <Button className="mt-3 w-full" onClick={() => start(nextType, short)}>
          세션 {nextType} 시작
        </Button>

        <SectionTitle right={`목표 ${profile.stepGoal.toLocaleString()}보`}>쉬는 날 활동량</SectionTitle>
        <Card>
          <p className="mb-2 text-xs text-zinc-500">{CARDIO.restDayNote}</p>
          <NumberField
            value={daily?.steps ?? null}
            onChange={saveSteps}
            placeholder="걸음 수"
            suffix="보"
          />
        </Card>
      </>
    )
  }

  /* ---------- 운동 중 ---------- */
  const exercises = SESSIONS[todaySession.type].exercises
  const totalSets = exercises.reduce((n, ex) => n + setsForMode(ex, todaySession.short), 0)
  const doneSets = todaySession.entries.reduce(
    (n, e) => n + e.sets.filter((s) => s.done).length,
    0,
  )
  const pct = totalSets ? Math.min(100, Math.round((doneSets / totalSets) * 100)) : 0

  return (
    <>
      <PageHeader
        title={`세션 ${todaySession.type}`}
        sub={formatKo(today)}
        right={
          todaySession.finishedAt ? (
            <Pill tone="emerald">완료</Pill>
          ) : (
            <Pill tone="sky">{doneSets}/{totalSets} 세트</Pill>
          )
        }
      />

      <div className="mb-4 h-px bg-zinc-800">
        <div className="h-full bg-zinc-100 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <SafetyBanner profile={profile} />

      <button
        onClick={toggleShortMode}
        className="mt-3 flex w-full items-center gap-3 rounded-lg bg-zinc-900/70 px-4 py-2.5 text-left"
      >
        <span
          className={`h-4 w-4 rounded border ${
            todaySession.short ? 'border-zinc-500 bg-zinc-100' : 'border-zinc-600'
          }`}
        />
        <span className="flex-1 text-sm text-zinc-200">40분 컷</span>
        <span className="text-xs text-zinc-500">1·2·3 유지 / 6·7·8 축소 / 4·5 제외</span>
      </button>

      <div className="mt-4 space-y-3">
        {exercises.map((ex) => {
          const entry = todaySession.entries.find((e) => e.exerciseId === ex.id)
          if (!entry) return null
          return (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              entry={entry}
              targetSets={setsForMode(ex, todaySession.short)}
              last={lastPerformance(sessions, ex.id, today)}
              onChange={updateEntry}
            />
          )
        })}
      </div>

      <div className="mt-4">
        <DraftTextArea
          value={todaySession.memo ?? ''}
          onChange={(v) => db.sessions.update(todaySession.id!, { memo: v })}
          placeholder="마지막 세트 잔여 느낌, 컨디션 메모…"
          rows={2}
        />
      </div>

      {!todaySession.finishedAt ? (
        <Button className="mt-3 w-full" onClick={finish}>
          운동 완료
        </Button>
      ) : (
        <Button
          className="mt-3 w-full"
          variant="ghost"
          onClick={() => db.sessions.update(todaySession.id!, { finishedAt: undefined })}
        >
          이어서 하기
        </Button>
      )}

      <Button
        className="mt-2 w-full"
        variant="danger"
        onClick={() => db.sessions.delete(todaySession.id!)}
      >
        오늘 세션 삭제
      </Button>
    </>
  )
}

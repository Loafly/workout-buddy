import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import PageHeader from '../components/PageHeader'
import { Button, Card, Empty, NumberField, Pill, SectionTitle } from '../components/ui'
import { db, getSetting, setSetting, type BodyRecord, type WorkoutSession } from '../db'
import { PHASES, PROGRESS_NOTES, VOLUME_RANGE } from '../data/guide'
import { phaseWeight } from '../data/profile'
import { useProfile } from '../hooks/useProfile'
import { findExercise } from '../data/program'
import { formatKo, formatShort, toDateKey, weekIndex, weekStart } from '../lib/date'
import { sessionTonnage, weeklyLossRate, weeklyVolume, weeklyWeightAverages } from '../lib/stats'

export default function History() {
  const today = toDateKey()
  const [w, setW] = useState<number | null>(null)
  const [waist, setWaist] = useState<number | null>(null)

  const { profile } = useProfile()
  const sessions = useLiveQuery(() => db.sessions.toArray(), [], [] as WorkoutSession[])
  const body = useLiveQuery(() => db.body.toArray(), [], [] as BodyRecord[])
  const startDate = useLiveQuery(() => getSetting<string | null>('programStart', null), [], null)

  const volume = weeklyVolume(sessions, today)
  const lossRate = weeklyLossRate(body)
  const avgs = weeklyWeightAverages(body)
  const week = startDate ? weekIndex(startDate, today) : null
  const phase = week == null ? null : PHASES[Math.min(3, Math.floor((week - 1) / 3))]

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))
  const sortedBody = [...body].sort((a, b) => b.date.localeCompare(a.date))

  const addBody = async () => {
    if (w == null && waist == null) return
    const existing = body.find((r) => r.date === today)
    const patch = { weightKg: w ?? existing?.weightKg, waistCm: waist ?? existing?.waistCm }
    if (existing?.id) await db.body.update(existing.id, patch)
    else await db.body.add({ date: today, ...patch })
    setW(null)
    setWaist(null)
  }

  return (
    <>
      <PageHeader
        title="기록"
        sub={week ? `프로그램 ${week}주차` : '12주 프로그램'}
        right={
          !startDate ? (
            <Button variant="ghost" className="px-3 py-2 text-xs" onClick={() => setSetting('programStart', today)}>
              오늘 시작
            </Button>
          ) : undefined
        }
      />

      {phase && (
        <Card>
          <div className="flex items-center gap-2">
            <Pill tone="sky">{phase.weeks}</Pill>
            {phaseWeight(profile, phase.endWeek) != null && (
              <span className="text-xs text-zinc-500">목표 {phaseWeight(profile, phase.endWeek)}kg 전후</span>
            )}
          </div>
          <p className="mt-2 text-sm text-zinc-200">{phase.goal}</p>
        </Card>
      )}

      <SectionTitle right={`${formatShort(weekStart(today))} 주간`}>이번 주 볼륨</SectionTitle>
      {Object.keys(volume).length === 0 ? (
        <Empty>이번 주 완료된 세트가 없습니다.</Empty>
      ) : (
        <div className="space-y-2">
          {Object.entries(VOLUME_RANGE).map(([muscle, [lo, hi]]) => {
            const v = volume[muscle as keyof typeof volume] ?? 0
            const tone = v === 0 ? 'bg-zinc-700' : v < lo ? 'bg-amber-500' : v > hi ? 'bg-rose-500' : 'bg-emerald-500'
            return (
              <div key={muscle} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-xs text-zinc-400">{muscle}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${tone}`}
                    style={{ width: `${Math.min(100, (v / hi) * 100)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs tabular-nums text-zinc-500">
                  {v} / {lo}~{hi}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <SectionTitle>체중 · 허리둘레</SectionTitle>
      <Card>
        <div className="flex gap-2">
          <NumberField value={w} onChange={setW} placeholder="체중" suffix="kg" step={0.1} className="flex-1" />
          <NumberField value={waist} onChange={setWaist} placeholder="허리" suffix="cm" step={0.5} className="flex-1" />
          <Button className="px-4 py-2" onClick={addBody}>
            기록
          </Button>
        </div>

        {avgs.length > 0 && (
          <div className="mt-4 space-y-1">
            <p className="text-xs text-zinc-500">주 평균 체중</p>
            {avgs.slice(-6).map((a) => (
              <div key={a.week} className="flex items-baseline gap-2 text-sm">
                <span className="w-14 text-xs tabular-nums text-zinc-500">{formatShort(a.week)}~</span>
                <span className="tabular-nums text-zinc-200">{a.avg.toFixed(1)}kg</span>
              </div>
            ))}
          </div>
        )}

        {lossRate != null && (
          <p
            className={`mt-3 rounded-lg p-2.5 text-xs ${
              lossRate > 0.5
                ? 'bg-zinc-900 text-amber-300'
                : lossRate < 0
                  ? 'bg-zinc-800/50 text-zinc-400'
                  : 'bg-zinc-900 text-emerald-300'
            }`}
          >
            지난주 대비 {lossRate >= 0 ? '-' : '+'}
            {Math.abs(lossRate).toFixed(2)}kg/주 —{' '}
            {lossRate > 0.5
              ? '주 0.5kg 초과. 근육 손실 구간이라 휴식일 탄수를 20~30g 올리세요.'
              : lossRate < 0
                ? '증가 중. 2~3주 정체·변동은 정상이니 허리둘레와 사진으로 판단하세요.'
                : '목표 범위(주 0.4kg 이하)입니다.'}
          </p>
        )}
      </Card>

      {sortedBody.length > 0 && (
        <ul className="mt-2 space-y-1">
          {sortedBody.slice(0, 5).map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-1 text-xs text-zinc-500">
              <span className="w-14 tabular-nums">{formatShort(r.date)}</span>
              <span className="tabular-nums text-zinc-400">
                {r.weightKg != null && `${r.weightKg}kg`}
                {r.waistCm != null && ` · 허리 ${r.waistCm}cm`}
              </span>
              <button onClick={() => db.body.delete(r.id!)} className="ml-auto active:text-rose-400">
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <SectionTitle right={`총 ${sessions.length}회`}>운동 일지</SectionTitle>
      {sorted.length === 0 ? (
        <Empty>아직 기록된 세션이 없습니다.</Empty>
      ) : (
        <ul className="space-y-2">
          {sorted.slice(0, 20).map((s) => {
            const done = s.entries.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0)
            return (
              <li key={s.id} className="rounded-lg bg-zinc-900/60 p-4">
                <div className="flex items-center gap-2">
                  <Pill tone="sky">세션 {s.type}</Pill>
                  {s.short && <Pill tone="amber">40분 컷</Pill>}
                  <span className="text-sm text-zinc-300">{formatKo(s.date)}</span>
                  <span className="ml-auto text-xs tabular-nums text-zinc-500">{done}세트</span>
                </div>
                <p className="mt-2 text-xs tabular-nums text-zinc-500">
                  총 볼륨 {Math.round(sessionTonnage(s)).toLocaleString()}kg
                </p>
                <ul className="mt-2 space-y-0.5">
                  {s.entries
                    .filter((e) => e.sets.some((x) => x.done))
                    .map((e) => (
                      <li key={e.exerciseId} className="text-xs text-zinc-400">
                        <span className="text-zinc-500">{findExercise(e.exerciseId)?.name}</span>{' '}
                        {e.sets
                          .filter((x) => x.done)
                          .map((x) => `${x.weight ?? '-'}×${x.reps ?? '-'}`)
                          .join(' / ')}
                      </li>
                    ))}
                </ul>
                {s.memo && <p className="mt-2 text-xs text-zinc-500 italic">{s.memo}</p>}
              </li>
            )
          })}
        </ul>
      )}

      <SectionTitle>판단 기준</SectionTitle>
      <ul className="space-y-1.5 rounded-lg bg-zinc-900/40 p-4 text-xs text-zinc-400">
        {PROGRESS_NOTES.map((n) => (
          <li key={n} className="flex gap-1.5">
            <span className="text-zinc-700">—</span>
            {n}
          </li>
        ))}
      </ul>
    </>
  )
}

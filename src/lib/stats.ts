import type { WorkoutSession, BodyRecord } from '../db'
import { findExercise, type Muscle } from '../data/program'
import { weekStart } from './date'

/** 주간 부위별 완료 세트 수 */
export function weeklyVolume(sessions: WorkoutSession[], anyDateInWeek: string) {
  const ws = weekStart(anyDateInWeek)
  const volume: Partial<Record<Muscle, number>> = {}
  for (const s of sessions) {
    if (weekStart(s.date) !== ws) continue
    for (const entry of s.entries) {
      const ex = findExercise(entry.exerciseId)
      if (!ex) continue
      const done = entry.sets.filter((set) => set.done).length
      if (done) volume[ex.muscle] = (volume[ex.muscle] ?? 0) + done
    }
  }
  return volume
}

/** 한 종목의 최근 수행 기록 (최신순) */
export function historyFor(sessions: WorkoutSession[], exerciseId: string) {
  return sessions
    .filter((s) => s.entries.some((e) => e.exerciseId === exerciseId && e.sets.some((x) => x.done)))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((s) => ({
      date: s.date,
      sets: s.entries.find((e) => e.exerciseId === exerciseId)!.sets.filter((x) => x.done),
    }))
}

/** 직전 수행 기록 — 오늘 세트의 기본값·힌트로 쓰기 위함 */
export function lastPerformance(sessions: WorkoutSession[], exerciseId: string, beforeDate: string) {
  return historyFor(sessions, exerciseId).find((h) => h.date < beforeDate) ?? null
}

/** 한 세션의 총 볼륨 (중량 × 횟수) */
export const sessionTonnage = (s: WorkoutSession) =>
  s.entries.reduce(
    (sum, e) =>
      sum + e.sets.reduce((a, set) => a + (set.done ? (set.weight ?? 0) * (set.reps ?? 0) : 0), 0),
    0,
  )

/** 주 평균 체중 — 계획서상 체중은 주 평균으로만 판단 */
export function weeklyWeightAverages(records: BodyRecord[]) {
  const buckets = new Map<string, number[]>()
  for (const r of records) {
    if (r.weightKg == null) continue
    const ws = weekStart(r.date)
    const arr = buckets.get(ws) ?? []
    arr.push(r.weightKg)
    buckets.set(ws, arr)
  }
  return [...buckets.entries()]
    .map(([week, vals]) => ({ week, avg: vals.reduce((a, b) => a + b, 0) / vals.length }))
    .sort((a, b) => a.week.localeCompare(b.week))
}

/**
 * 최근 감량 속도(kg/주). 계획서 기준 0.4kg/주 이하가 목표이고
 * 0.5kg/주를 넘으면 휴식일 탄수를 올려야 합니다.
 */
export function weeklyLossRate(records: BodyRecord[]) {
  const avgs = weeklyWeightAverages(records)
  if (avgs.length < 2) return null
  const last = avgs[avgs.length - 1]
  const prev = avgs[avgs.length - 2]
  return prev.avg - last.avg
}

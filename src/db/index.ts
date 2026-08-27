import Dexie, { type Table } from 'dexie'
import type { SessionType } from '../data/program'

/**
 * 로컬 전용 저장소 (IndexedDB). 서버 없이 기기 안에서만 데이터가 유지됩니다.
 */

export interface SetLog {
  weight: number | null
  reps: number | null
  done: boolean
}

export interface ExerciseLog {
  exerciseId: string
  sets: SetLog[]
  memo?: string
  /** 40분 컷에서 잘라낸 종목 */
  skipped?: boolean
}

export interface WorkoutSession {
  id?: number
  /** YYYY-MM-DD */
  date: string
  type: SessionType
  /** 40분 컷 모드 */
  short: boolean
  entries: ExerciseLog[]
  memo?: string
  startedAt: number
  finishedAt?: number
}

export interface Meal {
  id?: number
  date: string
  slot: string
  desc: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  createdAt: number
}

/** 하루 단위 컨디션·활동 기록 */
export interface DailyLog {
  /** YYYY-MM-DD — 기본키 */
  date: string
  steps?: number
  cardioMin?: number
  sleepHours?: number
  alcohol?: boolean
  /** 중단 신호 체크 목록 (STOP_SIGNALS 인덱스) */
  stopSignals?: number[]
  memo?: string
}

export interface BodyRecord {
  id?: number
  date: string
  weightKg?: number
  waistCm?: number
  bodyFatPct?: number
  memo?: string
}

export interface Settings {
  key: string
  value: unknown
}

/** 종목별로 사용자가 저장해 둔 참고 영상 */
export interface ExerciseLink {
  exerciseId: string
  url: string
  label?: string
}

class WorkoutDB extends Dexie {
  sessions!: Table<WorkoutSession, number>
  meals!: Table<Meal, number>
  daily!: Table<DailyLog, string>
  body!: Table<BodyRecord, number>
  settings!: Table<Settings, string>
  links!: Table<ExerciseLink, string>

  constructor() {
    super('workout-buddy')
    this.version(1).stores({
      sessions: '++id, date, type',
      meals: '++id, date',
      daily: 'date',
      body: '++id, date',
      settings: 'key',
    })
    this.version(2).stores({
      links: 'exerciseId',
    })
  }
}

export const db = new WorkoutDB()

/* ---------- settings helpers ---------- */

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key)
  return row === undefined ? fallback : (row.value as T)
}

export const setSetting = (key: string, value: unknown) => db.settings.put({ key, value })

/* ---------- 백업 / 복원 ---------- */

export async function exportAll() {
  const [sessions, meals, daily, body, settings, links] = await Promise.all([
    db.sessions.toArray(),
    db.meals.toArray(),
    db.daily.toArray(),
    db.body.toArray(),
    db.settings.toArray(),
    db.links.toArray(),
  ])
  return { version: 2, exportedAt: Date.now(), sessions, meals, daily, body, settings, links }
}

export type Backup = Awaited<ReturnType<typeof exportAll>>

export async function importAll(data: Backup) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.sessions)) {
    throw new Error('백업 파일 형식이 올바르지 않습니다.')
  }
  // 테이블이 6개라 배열 형태로 넘긴다 (가변 인자 오버로드는 5개까지)
  const tables = [db.sessions, db.meals, db.daily, db.body, db.settings, db.links]
  await db.transaction('rw', tables, async () => {
    await Promise.all([
      db.sessions.clear(),
      db.meals.clear(),
      db.daily.clear(),
      db.body.clear(),
      db.settings.clear(),
      db.links.clear(),
    ])
    await db.sessions.bulkAdd(data.sessions)
    await db.meals.bulkAdd(data.meals ?? [])
    await db.daily.bulkAdd(data.daily ?? [])
    await db.body.bulkAdd(data.body ?? [])
    await db.settings.bulkAdd(data.settings ?? [])
    // links 는 v2 에서 추가 — 이전 백업에는 없음
    await db.links.bulkAdd(data.links ?? [])
  })
}

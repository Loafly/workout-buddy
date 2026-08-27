export const toDateKey = (d: Date = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export const formatKo = (key: string) => {
  const date = parseKey(key)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`
}

export const formatShort = (key: string) => {
  const date = parseKey(key)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export const addDays = (key: string, n: number) => {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return toDateKey(d)
}

/** 해당 날짜가 속한 주의 월요일 */
export const weekStart = (key: string) => {
  const d = parseKey(key)
  const dow = (d.getDay() + 6) % 7 // 월=0
  d.setDate(d.getDate() - dow)
  return toDateKey(d)
}

export const daysBetween = (from: string, to: string) =>
  Math.round((parseKey(to).getTime() - parseKey(from).getTime()) / 86400000)

/** 프로그램 시작일 기준 몇 주차인지 (1부터) */
export const weekIndex = (startKey: string, key: string) =>
  Math.floor(daysBetween(weekStart(startKey), weekStart(key)) / 7) + 1

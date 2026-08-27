/**
 * 사용자 프로필 — 신체 정보·목표·주의사항은 전부 여기서 입력받습니다.
 * 소스에 특정인의 신체·병력을 넣지 않기 위한 구조입니다.
 */

export interface SafetyRule {
  title: string
  desc: string
}

export interface Profile {
  heightCm?: number
  weightKg?: number
  bodyFatPct?: number
  goalWeightKg?: number
  /** 체중 1kg당 단백질(g) */
  proteinPerKg: number
  /** 체중 1kg당 지방(g) */
  fatPerKg: number
  /** 직접 지정한 목표 칼로리. 비워두면 체중에서 추정 */
  trainingKcal?: number
  restKcal?: number
  weeklySessions: number
  stepGoal: number
  /** 레그레이즈 현재 단계 (1~5) */
  legRaiseStage: number
  /** 운동 경력·공백 등 자유 메모 */
  background?: string
  /** 주의가 필요한 이력·상태 (예: 특정 수술 이력) */
  conditionLabel?: string
  /** 매 운동에 적용할 안전 수칙 — 사용자가 직접 구성 */
  safetyRules: SafetyRule[]
  /** 트레이너에게 전달할 문장. 비워두면 위 항목으로 자동 생성 */
  trainerScript?: string
}

export const DEFAULT_PROFILE: Profile = {
  proteinPerKg: 2.0,
  fatPerKg: 0.9,
  weeklySessions: 3,
  stepGoal: 8000,
  legRaiseStage: 1,
  safetyRules: [],
}

/** 저장된 값이 일부만 있어도 항상 온전한 프로필을 돌려줍니다 */
export const normalize = (p: Partial<Profile> | null | undefined): Profile => ({
  ...DEFAULT_PROFILE,
  ...(p ?? {}),
  safetyRules: p?.safetyRules ?? [],
})

export const isConfigured = (p: Profile) => p.weightKg != null

/** 체중 기반 시작점 추정. 리컴프 기준 운동일 29kcal/kg, 휴식일 25.5kcal/kg */
export const suggestKcal = (weightKg: number) => ({
  training: Math.round((weightKg * 29) / 10) * 10,
  rest: Math.round((weightKg * 25.5) / 10) * 10,
})

export interface Macros {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export function macrosFor(p: Profile, training: boolean): Macros {
  const w = p.weightKg ?? 0
  const fallback = w ? suggestKcal(w) : { training: 0, rest: 0 }
  const kcal = (training ? p.trainingKcal : p.restKcal) ?? (training ? fallback.training : fallback.rest)
  const protein = Math.round(w * p.proteinPerKg)
  const fat = Math.round(w * p.fatPerKg)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { kcal, protein, carbs, fat }
}

/** 지방 하한선 — 호르몬 영향 때문에 0.7g/kg 아래로는 내리지 않는 것이 일반적 */
export const FAT_FLOOR_PER_KG = 0.7
export const fatFloor = (p: Profile) => Math.round((p.weightKg ?? 0) * FAT_FLOOR_PER_KG)

/**
 * 일반적인 웨이트 안전 수칙 템플릿.
 * 진단명이 아니라 누구에게나 해당하는 문장만 담고, 적용 여부는 사용자가 고릅니다.
 */
export const SAFETY_PRESETS: SafetyRule[] = [
  { title: '숨을 참지 않는다', desc: '미는 구간에서 반드시 숨을 뱉는다. 발살바 호흡 금지' },
  { title: 'RPE 7~8 유지', desc: '실패지점 2~3회 남기고 종료. 그라인딩 렙 금지' },
  { title: '8~15회 반복 구간 고수', desc: '5회 미만 고중량 세트 배제' },
  { title: '머리를 심장보다 낮추지 않는다', desc: '디클라인, 역위 자세 배제' },
  { title: '벨트를 과도하게 조이지 않는다', desc: '복압이 지나치게 올라가지 않도록' },
  { title: '반동을 쓰지 않는다', desc: '느리게 통제하며 수행. 폼은 옆면에서 촬영해 확인' },
  { title: '머리에 충격이 가는 종목 배제', desc: '' },
]

export function buildTrainerScript(p: Profile) {
  if (p.trainerScript?.trim()) return p.trainerScript.trim()
  if (!p.safetyRules.length && !p.conditionLabel) return ''
  const head = p.conditionLabel?.trim()
    ? `${p.conditionLabel.trim()}이 있어 주의가 필요합니다.`
    : '아래 조건으로 진행해야 합니다.'
  const body = p.safetyRules.map((r) => r.title).join(', ')
  // 조사(를/을)가 항목 끝소리에 따라 달라지므로 콜론으로 나열합니다
  return body ? `${head} 운동 시 다음 조건을 지켜야 합니다: ${body}.` : head
}

/** 프로그램 시작 체중 → 목표 체중까지 12주 선형 배분 */
export function phaseWeight(p: Profile, endWeek: number) {
  if (p.weightKg == null || p.goalWeightKg == null) return null
  const w = p.weightKg + ((p.goalWeightKg - p.weightKg) * endWeek) / 12
  return Math.round(w * 10) / 10
}

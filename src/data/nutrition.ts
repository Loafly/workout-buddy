/**
 * 일반적인 영양 참고 정보.
 * 개인 목표 칼로리·매크로는 프로필(src/data/profile.ts)에서 계산합니다.
 */

export const NUTRITION_RULES = [
  '단백질은 체중 기준으로 고정하고 탄수화물만 조절',
  '끼니당 단백질 35~40g × 4회 분할',
  '탄수화물은 운동 전후에 몰아 배치',
  '식이섬유 하루 25~30g',
  '저탄수 금지 — 근력이 먼저 떨어지고 근육 유지가 어려워짐',
]

export interface MealPreset {
  slot: string
  desc: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

/** 빠른 기록용 식단 템플릿 */
export const MEAL_PRESETS: MealPreset[] = [
  { slot: '아침', desc: '계란 3개 + 오트밀 60g + 그릭요거트 150g', kcal: 620, protein: 42, carbs: 55, fat: 26 },
  { slot: '점심', desc: '현미밥 200g + 닭가슴살 200g + 채소', kcal: 620, protein: 50, carbs: 78, fat: 8 },
  { slot: '운동 전', desc: '바나나 1개 + 아메리카노', kcal: 110, protein: 1, carbs: 27, fat: 0 },
  { slot: '저녁(운동 후)', desc: '밥 200g + 소고기 살코기 150g + 나물류', kcal: 700, protein: 38, carbs: 78, fat: 22 },
  { slot: '야식', desc: '카제인 or 그릭요거트 + 견과 15g', kcal: 280, protein: 28, carbs: 12, fat: 13 },
]

export const PROTEIN_REFERENCE = [
  ['닭가슴살 150g', 33],
  ['계란 3개', 19],
  ['그릭요거트 200g', 20],
  ['소고기 안심 150g', 32],
] as const

export const BELLY_FAT_FACTORS = [
  { factor: '술', reason: '지방 산화 직접 억제, 내장지방과 상관관계 최상위' },
  { factor: '수면 6시간 미만', reason: '코르티솔 상승 → 복부 축적 + 회복 저해' },
  { factor: '만성 스트레스', reason: '동일 경로' },
  { factor: '액상 과당', reason: '포만감 없이 칼로리만, 간지방 직행' },
]

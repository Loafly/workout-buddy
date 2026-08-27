/**
 * 일반적인 트레이닝 참고 정보.
 * 개인의 신체·병력·목표 수치는 여기 두지 않고 프로필(src/data/profile.ts)에서 입력받습니다.
 */

/** 중단 신호 */
export const STOP_SIGNALS = [
  { sign: '팔꿈치 안쪽/바깥쪽 콕콕 쑤심', meaning: '건염 초기', urgent: false },
  { sign: '문고리 돌리기 · 물병 따기가 아픔', meaning: '건염 진행', urgent: false },
  { sign: '운동 중 통증 사라졌다 다음날 심해짐', meaning: '전형적 건염 패턴', urgent: false },
  { sign: '이틀 넘게 계속 뻐근함', meaning: '회복 초과', urgent: false },
]

/** 레그레이즈 점진적 과부하 단계 */
export const LEG_RAISE_STAGES = [
  { stage: 1, label: '무릎 살짝 굽힘, 10회 × 3세트', condition: '10회 3세트가 힘든 상태 = 비대에 최적 구간' },
  { stage: 2, label: '다리를 더 펴기', condition: '3세트 모두 12회가 편해지면' },
  { stage: 3, label: '발 사이 덤벨 5kg', condition: '펴고도 12회가 편해지면' },
  { stage: 4, label: '행잉 니레이즈', condition: '덤벨 단계가 안정되면' },
  { stage: 5, label: '행잉 레그레이즈', condition: '니레이즈가 편해지면' },
]

/** 12주 진행 단계 — 목표 체중은 프로필에서 계산 */
export const PHASES = [
  { weeks: '1~3주', endWeek: 3, goal: '폼 익히기. 중량 욕심 금지. 종목 촬영해 확인' },
  { weeks: '4~6주', endWeek: 6, goal: '중량 상승 시작' },
  { weeks: '7~9주', endWeek: 9, goal: '레그레이즈 다음 단계 진입' },
  { weeks: '10~12주', endWeek: 12, goal: '허리둘레 감소, 체지방률 하락 확인' },
]

export const PROGRESS_NOTES = [
  '주 1회 같은 조건(아침 공복, 같은 장소·각도)으로 사진 + 허리둘레',
  '체중은 매일 재도 되지만 주 평균으로만 판단',
  '리컴프에서는 체중이 2~3주 정지하는 구간이 반드시 온다. 그때 칼로리를 더 깎는 것이 가장 흔한 실수',
  '감량 속도 주 0.4kg 이하. 주 0.5kg을 넘으면 휴식일 탄수를 20~30g 올릴 것',
]

/** 골반 전방경사 체크 */
export const APT_CHECK = {
  test: '벽에 등 붙이고 섰을 때 허리 뒤 공간에 손 하나 이상 들어가면 전방경사',
  why: '격투기·달리기처럼 장요근을 많이 쓰는 운동 이력이 있으면 단축 가능성이 있습니다. 골반이 앞으로 기울면 하복부가 밀려나와 보입니다',
  fix: ['장요근 스트레칭(런지 자세) 하루 2회 × 60초', '힙 쓰러스트', '데드버그'],
  note: '레그레이즈로는 해결되지 않음',
}

export const CARDIO = {
  restDayNote: '운동 안 가는 날의 걷기가 주 3회 체제에서 감량 유지의 핵심',
  extra: '사이클 · 로잉 · 경사 걷기 30분 (심박 130~145)',
  running: '체중이 많이 나가는 초기에는 러닝 대신 저충격 유산소 (충격 + 관절 부담)',
}

/** 주간 볼륨 적정 범위 (세트) */
export const VOLUME_RANGE: Record<string, [number, number]> = {
  가슴: [10, 20],
  등: [10, 20],
  하체: [10, 20],
  어깨: [8, 16],
  이두: [10, 20],
  삼두: [10, 20],
  복근: [8, 16],
}

export const DISCLAIMER =
  '이 앱의 내용은 일반적인 운동·영양 정보이며 의학적 조언이 아닙니다. 기존 질환이나 수술 이력이 있다면 운동 허용 범위를 주치의에게 확인하세요.'

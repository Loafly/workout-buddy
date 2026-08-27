/** 망막박리 이력 — 모든 운동에 적용되는 안압 관리 4원칙 */
export const EYE_RULES = [
  { title: '숨을 참지 않는다', desc: '미는 구간에서 반드시 "후" 하고 뱉기. 발살바 금지' },
  { title: 'RPE 7~8', desc: '실패지점 2~3회 남기고 종료. 그라인딩 렙 금지' },
  { title: '8~15회 반복 구간 고수', desc: '5회 미만 고중량 세트 배제' },
  { title: '머리를 심장보다 낮추지 않는다', desc: '디클라인, 역위 자세 배제' },
]

export const EYE_NOTES = [
  '벨트 과도한 조임 주의 (복압 → 안압 전달)',
  '머리 충격 종목 배제',
  '운동 재개 전 주치의에게 웨이트 허용 강도 확인 필요',
]

export const TRAINER_SCRIPT =
  '망막박리 이력이 있어 호흡 참는 고중량은 못 합니다. 8~15회 구간, 실패지점 전 종료, 머리 낮추는 자세 배제로 부탁드립니다.'

/** 중단 신호 */
export const STOP_SIGNALS = [
  { sign: '팔꿈치 안쪽/바깥쪽 콕콕 쑤심', meaning: '건염 초기', urgent: false },
  { sign: '문고리 돌리기 · 물병 따기가 아픔', meaning: '건염 진행', urgent: false },
  { sign: '운동 중 통증 사라졌다 다음날 심해짐', meaning: '전형적 건염 패턴', urgent: false },
  { sign: '이틀 넘게 계속 뻐근함', meaning: '회복 초과', urgent: false },
  { sign: '눈 관련 증상 (비문증 증가, 시야 가림, 번쩍임)', meaning: '즉시 중단 후 안과 내원', urgent: true },
]

/** 레그레이즈 점진적 과부하 단계 */
export const LEG_RAISE_STAGES = [
  { stage: 1, label: '무릎 살짝 굽힘, 10회 × 3세트', condition: '현재 단계' },
  { stage: 2, label: '다리를 더 펴기', condition: '3세트 모두 12회가 편해지면' },
  { stage: 3, label: '발 사이 덤벨 5kg', condition: '펴고도 12회가 편해지면' },
  { stage: 4, label: '행잉 니레이즈', condition: '덤벨 단계가 안정되면' },
  { stage: 5, label: '행잉 레그레이즈', condition: '니레이즈가 편해지면' },
]

/** 12주 진행 기준 */
export const PHASES = [
  { weeks: '1~3주', goal: '폼 익히기. 중량 욕심 금지. 종목 촬영해 확인', weight: null },
  { weeks: '4~6주', goal: '중량 상승 시작', weight: '80kg 전후' },
  { weeks: '7~9주', goal: '레그레이즈 다리 펴기 단계 진입', weight: '78~79kg' },
  { weeks: '10~12주', goal: '허리둘레 -4~5cm, 체지방률 15~17%', weight: '77kg 전후' },
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
  why: 'MMA 3년 이력이면 장요근 단축 가능성 있음. 골반이 앞으로 기울면 하복부가 밀려나와 보인다',
  fix: ['장요근 스트레칭(런지 자세) 하루 2회 × 60초', '힙 쓰러스트', '데드버그'],
  note: '레그레이즈로는 해결되지 않음',
}

export const CARDIO = {
  steps: 8000,
  restDayNote: '운동 안 가는 날 걷기 8,000보 — 주 3회 체제에서 감량 유지의 핵심',
  extra: '사이클 · 로잉 · 경사 걷기 30분 (심박 130~145)',
  running: '러닝은 초기 4주 제외 (충격 + 82kg 관절 부담)',
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

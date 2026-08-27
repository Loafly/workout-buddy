export type SessionType = 'A' | 'B'
export type Muscle = '가슴' | '등' | '하체' | '어깨' | '이두' | '삼두' | '복근'

export interface Exercise {
  /** 로그 참조용 고정 키 — 절대 바꾸지 말 것 */
  id: string
  order: number
  name: string
  muscle: Muscle
  sets: number
  /** 목표 반복 구간 [min, max] */
  reps: [number, number]
  /** 40분 컷 우선순위: keep=유지, reduce=2세트로 축소, cut=제거 */
  short: 'keep' | 'reduce' | 'cut'
  /** 매 세션 고정 블록(6·7·8번) */
  fixedBlock?: boolean
  cues?: string[]
}

export interface Session {
  type: SessionType
  exercises: Exercise[]
}

const LEG_RAISE: Omit<Exercise, 'order'> = {
  id: 'incline-leg-raise',
  name: '경사 레그레이즈',
  muscle: '복근',
  sets: 3,
  reps: [10, 10],
  short: 'reduce',
  fixedBlock: true,
  cues: [
    '무릎 15~20도 굽힌 상태로 시작 (완전히 편 다리는 장요근 개입이 큼)',
    '꼬리뼈를 천장으로 밀어올리듯 엉덩이를 패드에서 뗀다 — 이 마지막 구간이 핵심',
    '최상단 1초 정지 후 3~4초에 걸쳐 천천히 내린다',
    '허리가 뜨기 전에 멈춘다',
    '골반 말아올릴 때 "후" 하고 뱉기 — 발살바가 가장 걸리기 쉬운 구간',
    '머리가 위쪽인 경사 벤치만 사용. 슬랜트 보드(머리 아래) 배제',
  ],
}

export const SESSIONS: Record<SessionType, Session> = {
  A: {
    type: 'A',
    exercises: [
      {
        id: 'machine-chest-press', order: 1, name: '머신 체스트 프레스', muscle: '가슴',
        sets: 3, reps: [10, 12], short: 'keep',
        cues: ['손잡이가 가슴 중앙 높이', '어깨 뒤로 내리고 가슴 펴기', '팔꿈치 완전히 잠그지 않기'],
      },
      {
        id: 'lat-pulldown', order: 2, name: '랫 풀다운', muscle: '등',
        sets: 3, reps: [10, 12], short: 'keep',
        cues: ['쇄골 쪽으로 당기기 (목 뒤 금지)', '팔꿈치를 아래 주머니에 꽂는 느낌', '상체 15도 기울여 고정'],
      },
      {
        id: 'leg-press', order: 3, name: '레그 프레스', muscle: '하체',
        sets: 3, reps: [12, 15], short: 'keep',
        cues: ['무릎 90도까지만', '엉덩이 뜨면 너무 깊음', '무릎이 안으로 모이지 않게', '등받이 각도는 세울 것'],
      },
      {
        id: 'machine-shoulder-press', order: 4, name: '머신 숄더 프레스', muscle: '어깨',
        sets: 3, reps: [10, 12], short: 'cut',
        cues: ['손잡이가 귀~어깨 높이', '허리가 등받이에서 뜨면 중량 과다'],
      },
      {
        id: 'leg-curl', order: 5, name: '레그 컬', muscle: '하체',
        sets: 3, reps: [12, 15], short: 'cut',
        cues: ['관절 축과 기계 회전축 일치 확인', '내릴 때 3초에 걸쳐 천천히'],
      },
      {
        id: 'dumbbell-curl', order: 6, name: '덤벨 컬', muscle: '이두',
        sets: 3, reps: [10, 12], short: 'reduce', fixedBlock: true,
        cues: ['반동 금지', '팔꿈치 고정'],
      },
      {
        id: 'triceps-pushdown', order: 7, name: '삼두 푸시다운', muscle: '삼두',
        sets: 3, reps: [10, 12], short: 'reduce', fixedBlock: true,
        cues: ['팔꿈치를 옆구리에 붙여 고정', '미는 구간에서 "후" 뱉기'],
      },
      { ...LEG_RAISE, order: 8 },
    ],
  },
  B: {
    type: 'B',
    exercises: [
      {
        id: 'seated-cable-row', order: 1, name: '시티드 케이블 로우', muscle: '등',
        sets: 3, reps: [10, 12], short: 'keep',
        cues: ['허리 굽히지 않기', '날개뼈를 먼저 붙이고 팔은 그다음'],
      },
      {
        id: 'incline-db-press', order: 2, name: '인클라인 덤벨 프레스', muscle: '가슴',
        sets: 3, reps: [10, 12], short: 'keep',
        cues: ['벤치 30~40도', '어깨 뒤로 내리고 가슴 펴기', '미는 구간에서 반드시 숨 뱉기'],
      },
      {
        id: 'hack-squat', order: 3, name: '핵 스쿼트 (또는 스미스 스쿼트)', muscle: '하체',
        sets: 3, reps: [10, 12], short: 'keep',
        cues: ['무릎이 안으로 모이지 않게', '벨트를 과도하게 조이지 않기 (복압 상승 주의)'],
      },
      {
        id: 'lateral-raise', order: 4, name: '사이드 래터럴 레이즈', muscle: '어깨',
        sets: 3, reps: [15, 15], short: 'cut',
        cues: ['반동 금지', '어깨 높이까지만'],
      },
      {
        id: 'leg-extension', order: 5, name: '레그 익스텐션', muscle: '하체',
        sets: 3, reps: [12, 15], short: 'cut',
        cues: ['관절 축과 기계 회전축 일치 확인', '내릴 때 3초에 걸쳐 천천히'],
      },
      {
        id: 'hammer-curl', order: 6, name: '해머 컬', muscle: '이두',
        sets: 3, reps: [10, 12], short: 'reduce', fixedBlock: true,
        cues: ['반동 금지', '팔꿈치 고정'],
      },
      {
        id: 'overhead-db-extension', order: 7, name: '오버헤드 덤벨 익스텐션', muscle: '삼두',
        sets: 3, reps: [10, 12], short: 'reduce', fixedBlock: true,
        cues: ['팔꿈치 벌어지지 않게', '머리가 심장보다 낮아지지 않게 앉거나 서서 수행'],
      },
      { ...LEG_RAISE, order: 8 },
    ],
  },
}

export const ALL_EXERCISES = [...SESSIONS.A.exercises, ...SESSIONS.B.exercises]

export const findExercise = (id: string) => ALL_EXERCISES.find((e) => e.id === id)

/** 40분 컷 모드에서 이 종목이 수행할 세트 수. 0이면 건너뜀 */
export const setsForMode = (ex: Exercise, short: boolean) =>
  !short ? ex.sets : ex.short === 'keep' ? ex.sets : ex.short === 'reduce' ? 2 : 0

export const repsLabel = (ex: Exercise) =>
  ex.reps[0] === ex.reps[1] ? `${ex.reps[0]}회` : `${ex.reps[0]}-${ex.reps[1]}회`

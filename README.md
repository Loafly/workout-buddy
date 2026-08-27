# 운동 비서 (workout-buddy)

개인 운동·식단 계획서를 그대로 옮긴 개인용 PWA.
데이터는 **기기 로컬(IndexedDB)** 에만 저장되며 서버로 나가지 않습니다.

## 화면

| 탭 | 하는 일 |
|---|---|
| 오늘 | 세션 A/B 자동 교대 추천 → 세트별 중량·횟수 기록. 40분 컷 토글, 자세 큐, 안압 4원칙 상시 노출 |
| 식단 | 운동일/휴식일 자동 판별 후 목표 매크로 대비 섭취량. 계획서 예시 식단 원탭 기록, 수면·음주 체크 |
| 기록 | 주간 부위별 볼륨(적정 범위 대비), 주 평균 체중·감량 속도 경고, 운동 일지, 12주 단계 |
| 가이드 | 안압 4원칙, 트레이너 전달 문장(복사), 중단 신호, 레그레이즈 과부하 단계, 골반 전방경사 체크 |
| 설정 | 프로그램 시작일, JSON 백업/복원, 전체 삭제 |

### 계획서가 앱 로직으로 들어간 부분
- **세션 교대** — 마지막 세션의 반대 타입을 추천 (A → B → A → B)
- **40분 컷** — 1·2·3번 유지 / 6·7·8번 2세트로 축소 / 4·5번 제외를 자동 적용
- **감량 속도** — 주 평균 체중 차이가 0.5kg/주를 넘으면 "휴식일 탄수 +20~30g" 경고
- **매크로 목표** — 그날 운동 기록이 있으면 2,400kcal, 없으면 2,100kcal (단백질 165g 고정)
- **주간 볼륨** — 부위별 완료 세트를 적정 범위와 비교해 부족/과다 색으로 표시
- **직전 기록 프리필** — 완료 체크 시 지난 수행의 중량·횟수를 기본값으로 채움

## 스택
Vite + React 19 + TypeScript / Tailwind CSS v4 / vite-plugin-pwa / Dexie(IndexedDB) / React Router(HashRouter)

## 개발
```bash
npm run dev      # 로컬 개발 서버 (서비스 워커도 dev에서 동작)
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 확인 (PWA 설치 테스트는 여기서)
```

## 배포 (GitHub Pages)
1. GitHub에 `workout-buddy` 리포지토리 생성 후 push
2. Settings → Pages → Source: **GitHub Actions**
3. `main` 에 push하면 `.github/workflows/deploy.yml` 이 자동 배포
4. `https://<username>.github.io/workout-buddy/` → 모바일에서 열고 "홈 화면에 추가"

> 리포 이름이 다르면 `vite.config.ts` 의 `REPO_NAME` 만 수정.

## 폴더 구조
```
src/
  data/       program.ts(세션 A/B·큐) · nutrition.ts(매크로·식단) · guide.ts(안압·중단신호·12주)
  db/         Dexie 스키마 + 백업/복원
  lib/        date.ts · stats.ts(볼륨·주평균 체중·감량속도)
  pages/      Today · Diet · History · Guide · Settings
  components/ TabBar · ExerciseCard · EyeRuleBanner · ui.tsx
```

## 주의
브라우저 데이터를 지우거나 기기를 바꾸면 기록이 사라집니다. 설정 탭에서 주기적으로 백업하세요.

이 앱의 내용은 일반적인 운동·영양 정보이며 의학적 조언이 아닙니다.
망막 관련 운동 허용 범위는 주치의 확인이 필요합니다.

## 라이선스

[PolyForm Noncommercial License 1.0.0](LICENSE.md) — 소스는 공개되어 있고 개인적·비영리 목적으로는
열람·수정·재배포할 수 있지만, **상업적 이용은 허용되지 않습니다.**

Required Notice: Copyright 2026 Namseok Kim (https://github.com/Loafly)

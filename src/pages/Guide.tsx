import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Card, Empty, Pill, SectionTitle } from '../components/ui'
import {
  APT_CHECK,
  CARDIO,
  DISCLAIMER,
  LEG_RAISE_STAGES,
  PHASES,
  STOP_SIGNALS,
} from '../data/guide'
import { BELLY_FAT_FACTORS } from '../data/nutrition'
import { SESSIONS } from '../data/program'
import { buildTrainerScript, phaseWeight } from '../data/profile'
import { useProfile } from '../hooks/useProfile'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type ExerciseLink } from '../db'
import { searchKo } from '../lib/links'

export default function Guide() {
  const [copied, setCopied] = useState(false)
  const { profile } = useProfile()
  const script = buildTrainerScript(profile)
  const links = useLiveQuery(() => db.links.toArray(), [], [] as ExerciseLink[])
  const linkFor = (id: string) => links.find((l) => l.exerciseId === id)?.url

  const copyScript = async () => {
    if (!script) return
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <PageHeader title="가이드" />

      <SectionTitle right={profile.safetyRules.length ? '설정에서 편집' : undefined}>
        내 안전 수칙
      </SectionTitle>
      {profile.safetyRules.length === 0 ? (
        <Link to="/settings" className="block">
          <Empty>
            매 운동에 적용할 수칙을 설정에서 등록하세요.
            <br />
            등록하면 운동 화면 최상단에 항상 표시됩니다.
          </Empty>
        </Link>
      ) : (
        <div className="space-y-2">
          {profile.conditionLabel?.trim() && (
            <p className="px-1 text-xs text-amber-400/80">{profile.conditionLabel.trim()}</p>
          )}
          {profile.safetyRules.map((r, i) => (
            <div key={r.title} className="rounded-lg border border-l-2 border-amber-600/70 p-4">
              <p className="text-sm font-semibold text-amber-200">
                {i + 1}. {r.title}
              </p>
              {r.desc && <p className="mt-1 text-xs text-amber-100/70">{r.desc}</p>}
            </div>
          ))}
        </div>
      )}

      {script && (
        <>
          <SectionTitle right={copied ? '복사됨' : undefined}>트레이너에게 전달할 문장</SectionTitle>
          <Card onClick={copyScript} className="active:bg-zinc-800">
            <p className="text-sm leading-relaxed text-zinc-200">"{script}"</p>
            <p className="mt-2 text-xs text-zinc-400">탭하면 복사됩니다</p>
          </Card>
        </>
      )}

      <SectionTitle>중단 신호</SectionTitle>
      <div className="space-y-2">
        {STOP_SIGNALS.map((s) => (
          <div key={s.sign} className="rounded-lg bg-zinc-900/60 p-3">
            <p className="text-sm text-zinc-200">{s.sign}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{s.meaning}</p>
          </div>
        ))}
        <div className="mt-1 border-l-2 border-rose-600/70 py-1 pl-3">
          <p className="text-sm font-medium text-rose-300">
            등록한 이력과 관련된 증상이 나타나면 즉시 중단
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            운동 중 새로 생긴 증상은 참고 넘기지 말고 해당 진료과에서 확인하세요.
          </p>
        </div>
      </div>

      <SectionTitle right={`현재 ${profile.legRaiseStage}단계`}>레그레이즈 (하복부)</SectionTitle>
      <div className="space-y-2">
        {LEG_RAISE_STAGES.map((s) => {
          const current = s.stage === profile.legRaiseStage
          return (
            <div
              key={s.stage}
              className={`flex items-start gap-3 rounded-lg border p-3 ${
                current ? 'border-zinc-600 bg-zinc-800/50' : 'border-zinc-800 bg-zinc-900/60'
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums ${
                  current ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {s.stage}
              </span>
              <div>
                <p className={`text-sm ${current ? 'text-zinc-100' : 'text-zinc-200'}`}>{s.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{s.condition}</p>
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-2 px-1 text-xs text-zinc-500">
        복근 두께 변화는 최소 3~6개월 단위로 팔·가슴보다 느립니다. 건획(복근 칸)의 위치·개수는
        유전이고 두께만 바꿀 수 있습니다. 하복부는 원래 상복부보다 덜 선명합니다.
      </p>

      <SectionTitle>골반 전방경사 확인</SectionTitle>
      <Card>
        <p className="text-sm text-zinc-200">{APT_CHECK.test}</p>
        <p className="mt-2 text-xs text-zinc-500">{APT_CHECK.why}</p>
        <ul className="mt-3 space-y-1 text-xs text-zinc-400">
          {APT_CHECK.fix.map((f) => (
            <li key={f} className="flex gap-1.5">
              <span className="text-zinc-700">—</span>
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-amber-400/80">{APT_CHECK.note}</p>
      </Card>

      <SectionTitle>프로그램 구성</SectionTitle>
      <div className="space-y-3">
        {(['A', 'B'] as const).map((t) => (
          <Card key={t}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-100">세션 {t}</span>
              <Pill>워밍업 사이클 5분 + 동적 스트레칭 3분</Pill>
            </div>
            <ul>
              {SESSIONS[t].exercises.map((e) => {
                const saved = linkFor(e.id)
                return (
                  <li key={e.id}>
                    <a
                      href={saved ?? searchKo(e)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="-mx-1 flex items-baseline gap-2 rounded px-1 py-1 text-xs active:bg-zinc-800"
                    >
                      <span className="w-3 tabular-nums text-zinc-600">{e.order}</span>
                      <span className={e.fixedBlock ? 'font-medium text-zinc-200' : 'text-zinc-300'}>
                        {e.name}
                      </span>
                      <span className="text-zinc-700">{saved ? '\u25b6' : '\u2197'}</span>
                      <span className="ml-auto tabular-nums text-zinc-500">
                        {e.sets}×{e.reps[0] === e.reps[1] ? e.reps[0] : `${e.reps[0]}-${e.reps[1]}`}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </Card>
        ))}
      </div>
      <p className="mt-2 px-1 text-xs text-zinc-600">
        종목을 누르면 영상이 열립니다. ↗ 는 유튜브 검색, ▶ 는 저장해 둔 영상입니다.
        영상은 운동 화면에서 종목의 "자세 · 영상"을 펼쳐 저장할 수 있습니다.
      </p>
      <p className="mt-2 px-1 text-xs text-zinc-500">
        6·7·8번(이두/삼두/하복부)은 매 세션 고정 블록입니다. 팔이 지치면 등·프레스 중량이 떨어지고,
        복근이 지치면 척추 안정성이 낮아져 부상 경로가 되므로 마지막에 둡니다.
      </p>

      <SectionTitle>유산소 · 활동량</SectionTitle>
      <Card>
        <ul className="space-y-1.5 text-xs text-zinc-400">
          <li className="flex gap-1.5">
            <span className="text-zinc-700">—</span>
            쉬는 날 걷기 {profile.stepGoal.toLocaleString()}보 — {CARDIO.restDayNote}
          </li>
          <li className="flex gap-1.5">
            <span className="text-zinc-700">—</span>
            {CARDIO.extra}
          </li>
          <li className="flex gap-1.5">
            <span className="text-zinc-700">—</span>
            {CARDIO.running}
          </li>
        </ul>
      </Card>

      <SectionTitle>복부지방에 특히 영향이 큰 요소</SectionTitle>
      <div className="space-y-2">
        {BELLY_FAT_FACTORS.map((f) => (
          <div key={f.factor} className="rounded-lg bg-zinc-900/60 px-4 py-3">
            <p className="text-sm text-zinc-200">{f.factor}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{f.reason}</p>
          </div>
        ))}
      </div>

      <SectionTitle>12주 진행 기준</SectionTitle>
      <div className="space-y-2">
        {PHASES.map((p) => {
          const w = phaseWeight(profile, p.endWeek)
          return (
            <div key={p.weeks} className="rounded-lg bg-zinc-900/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <Pill tone="sky">{p.weeks}</Pill>
                {w != null && <span className="text-xs text-zinc-500">{w}kg 전후</span>}
              </div>
              <p className="mt-1.5 text-sm text-zinc-300">{p.goal}</p>
            </div>
          )
        })}
      </div>

      <p className="mt-6 rounded-lg bg-zinc-900/40 p-3 text-[11px] leading-relaxed text-zinc-600">
        {DISCLAIMER}
      </p>
    </>
  )
}

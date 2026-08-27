import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Card, Pill, SectionTitle } from '../components/ui'
import {
  APT_CHECK,
  CARDIO,
  EYE_NOTES,
  EYE_RULES,
  LEG_RAISE_STAGES,
  PHASES,
  STOP_SIGNALS,
  TRAINER_SCRIPT,
} from '../data/guide'
import { BELLY_FAT_FACTORS } from '../data/nutrition'
import { SESSIONS } from '../data/program'

export default function Guide() {
  const [copied, setCopied] = useState(false)

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(TRAINER_SCRIPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <PageHeader title="가이드" sub="계획서 요약" />

      <SectionTitle>안압 관리 4원칙</SectionTitle>
      <div className="space-y-2">
        {EYE_RULES.map((r, i) => (
          <div key={r.title} className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-4">
            <p className="text-sm font-semibold text-amber-200">
              {i + 1}. {r.title}
            </p>
            <p className="mt-1 text-xs text-amber-100/70">{r.desc}</p>
          </div>
        ))}
      </div>
      <ul className="mt-2 space-y-1 px-1 text-xs text-slate-500">
        {EYE_NOTES.map((n) => (
          <li key={n}>· {n}</li>
        ))}
      </ul>

      <SectionTitle right={copied ? '복사됨' : undefined}>트레이너에게 전달할 문장</SectionTitle>
      <Card onClick={copyScript} className="active:bg-slate-800">
        <p className="text-sm leading-relaxed text-slate-200">"{TRAINER_SCRIPT}"</p>
        <p className="mt-2 text-xs text-sky-500">탭하면 복사됩니다</p>
      </Card>

      <SectionTitle>중단 신호</SectionTitle>
      <div className="space-y-2">
        {STOP_SIGNALS.map((s) => (
          <div
            key={s.sign}
            className={`rounded-xl border p-3 ${
              s.urgent ? 'border-rose-800 bg-rose-950/30' : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <p className={`text-sm ${s.urgent ? 'font-semibold text-rose-200' : 'text-slate-200'}`}>
              {s.sign}
            </p>
            <p className={`mt-0.5 text-xs ${s.urgent ? 'text-rose-300' : 'text-slate-500'}`}>
              {s.meaning}
            </p>
          </div>
        ))}
      </div>

      <SectionTitle>레그레이즈 (하복부)</SectionTitle>
      <div className="space-y-2">
        {LEG_RAISE_STAGES.map((s) => (
          <div key={s.stage} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs tabular-nums text-slate-400">
              {s.stage}
            </span>
            <div>
              <p className="text-sm text-slate-200">{s.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{s.condition}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 px-1 text-xs text-slate-500">
        10회 × 3세트가 힘든 현재 상태가 비대에 최적 구간입니다. 중량 추가는 불필요합니다.
        복근 두께 변화는 최소 3~6개월 단위이고, 건획(복근 칸)의 위치·개수는 유전입니다.
      </p>

      <SectionTitle>골반 전방경사 확인</SectionTitle>
      <Card>
        <p className="text-sm text-slate-200">{APT_CHECK.test}</p>
        <p className="mt-2 text-xs text-slate-500">{APT_CHECK.why}</p>
        <ul className="mt-3 space-y-1 text-xs text-slate-400">
          {APT_CHECK.fix.map((f) => (
            <li key={f} className="flex gap-1.5">
              <span className="text-sky-600">·</span>
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
              <span className="text-sm font-bold text-slate-100">세션 {t}</span>
              <Pill>워밍업 사이클 5분 + 동적 스트레칭 3분</Pill>
            </div>
            <ul className="space-y-1">
              {SESSIONS[t].exercises.map((e) => (
                <li key={e.id} className="flex items-baseline gap-2 text-xs">
                  <span className="w-3 tabular-nums text-slate-600">{e.order}</span>
                  <span className={e.fixedBlock ? 'font-medium text-sky-300' : 'text-slate-300'}>
                    {e.name}
                  </span>
                  <span className="ml-auto tabular-nums text-slate-500">
                    {e.sets}×{e.reps[0] === e.reps[1] ? e.reps[0] : `${e.reps[0]}-${e.reps[1]}`}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <p className="mt-2 px-1 text-xs text-slate-500">
        6·7·8번(이두/삼두/하복부)은 매 세션 고정 블록입니다. 팔이 지치면 등·프레스 중량이 떨어지고,
        복근이 지치면 척추 안정성이 낮아져 부상 경로가 되므로 마지막에 둡니다.
      </p>

      <SectionTitle>유산소 · 활동량</SectionTitle>
      <Card>
        <ul className="space-y-1.5 text-xs text-slate-400">
          <li className="flex gap-1.5">
            <span className="text-sky-600">·</span>
            {CARDIO.restDayNote}
          </li>
          <li className="flex gap-1.5">
            <span className="text-sky-600">·</span>
            {CARDIO.extra}
          </li>
          <li className="flex gap-1.5">
            <span className="text-sky-600">·</span>
            {CARDIO.running}
          </li>
        </ul>
      </Card>

      <SectionTitle>복부지방에 특히 영향이 큰 요소</SectionTitle>
      <div className="space-y-2">
        {BELLY_FAT_FACTORS.map((f) => (
          <div key={f.factor} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
            <p className="text-sm text-slate-200">{f.factor}</p>
            <p className="mt-0.5 text-xs text-slate-500">{f.reason}</p>
          </div>
        ))}
      </div>

      <SectionTitle>12주 진행 기준</SectionTitle>
      <div className="space-y-2">
        {PHASES.map((p) => (
          <div key={p.weeks} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Pill tone="sky">{p.weeks}</Pill>
              {p.weight && <span className="text-xs text-slate-500">{p.weight}</span>}
            </div>
            <p className="mt-1.5 text-sm text-slate-300">{p.goal}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-xl bg-slate-900/40 p-3 text-[11px] leading-relaxed text-slate-600">
        이 앱의 내용은 일반적인 운동·영양 정보이며 의학적 조언이 아닙니다. 망막 관련 운동 허용 범위는
        수술 방식과 경과에 따라 다르므로 주치의 확인이 필요합니다.
      </p>
    </>
  )
}

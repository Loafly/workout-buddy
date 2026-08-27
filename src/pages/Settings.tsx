import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import PageHeader from '../components/PageHeader'
import { Button, Card, NumberField, Pill, SectionTitle } from '../components/ui'
import { Row, TextArea, TextField } from '../components/TextField'
import { db, exportAll, getSetting, importAll, setSetting } from '../db'
import { useProfile } from '../hooks/useProfile'
import {
  buildTrainerScript,
  fatFloor,
  macrosFor,
  SAFETY_PRESETS,
  suggestKcal,
  type SafetyRule,
} from '../data/profile'
import { LEG_RAISE_STAGES } from '../data/guide'
import { formatKo, toDateKey } from '../lib/date'

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [newRule, setNewRule] = useState<SafetyRule>({ title: '', desc: '' })
  const { profile, save } = useProfile()
  const startDate = useLiveQuery(() => getSetting<string | null>('programStart', null), [], null)

  const w = profile.weightKg
  const suggestion = w ? suggestKcal(w) : null
  const training = macrosFor(profile, true)
  const rest = macrosFor(profile, false)

  const addRule = (r: SafetyRule) => {
    if (!r.title.trim()) return
    if (profile.safetyRules.some((x) => x.title === r.title)) return
    save({ safetyRules: [...profile.safetyRules, { title: r.title.trim(), desc: r.desc.trim() }] })
  }

  const removeRule = (title: string) =>
    save({ safetyRules: profile.safetyRules.filter((r) => r.title !== title) })

  const handleExport = async () => {
    const data = await exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout-backup-${toDateKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('백업 파일을 내려받았습니다.')
  }

  const handleImport = async (file: File) => {
    try {
      await importAll(JSON.parse(await file.text()))
      setMsg('복원 완료.')
    } catch (e) {
      setMsg(`복원 실패: ${e instanceof Error ? e.message : '파일을 확인해주세요.'}`)
    }
  }

  const unusedPresets = SAFETY_PRESETS.filter(
    (p) => !profile.safetyRules.some((r) => r.title === p.title),
  )

  return (
    <>
      <PageHeader title="설정" sub="입력한 내용은 이 기기에만 저장됩니다" />

      <SectionTitle>신체</SectionTitle>
      <Card>
        <Row label="키">
          <NumberField value={profile.heightCm ?? null} onChange={(v) => save({ heightCm: v ?? undefined })} placeholder="170" suffix="cm" step={0.5} />
        </Row>
        <Row label="현재 체중" hint="매크로 계산의 기준값">
          <NumberField value={profile.weightKg ?? null} onChange={(v) => save({ weightKg: v ?? undefined })} placeholder="75" suffix="kg" step={0.1} />
        </Row>
        <Row label="체지방률">
          <NumberField value={profile.bodyFatPct ?? null} onChange={(v) => save({ bodyFatPct: v ?? undefined })} placeholder="20" suffix="%" step={0.1} />
        </Row>
        <Row label="목표 체중" hint="12주 단계별 목표 계산에 사용">
          <NumberField value={profile.goalWeightKg ?? null} onChange={(v) => save({ goalWeightKg: v ?? undefined })} placeholder="70" suffix="kg" step={0.1} />
        </Row>
        <div className="pt-2">
          <p className="mb-1.5 text-sm text-zinc-300">운동 경력 · 공백</p>
          <TextArea
            value={profile.background ?? ''}
            onChange={(v) => save({ background: v })}
            placeholder="예: 종목 · 경력 · 공백 기간"
            rows={2}
          />
        </div>
      </Card>

      <SectionTitle>목표 칼로리 · 매크로</SectionTitle>
      <Card>
        <Row label="운동일" hint={suggestion ? `추정 ${suggestion.training}kcal` : '체중을 먼저 입력하세요'}>
          <NumberField value={profile.trainingKcal ?? null} onChange={(v) => save({ trainingKcal: v ?? undefined })} placeholder={suggestion ? String(suggestion.training) : '—'} suffix="kcal" step={50} />
        </Row>
        <Row label="휴식일" hint={suggestion ? `추정 ${suggestion.rest}kcal` : ''}>
          <NumberField value={profile.restKcal ?? null} onChange={(v) => save({ restKcal: v ?? undefined })} placeholder={suggestion ? String(suggestion.rest) : '—'} suffix="kcal" step={50} />
        </Row>
        <Row label="단백질" hint="체중 1kg당">
          <NumberField value={profile.proteinPerKg} onChange={(v) => save({ proteinPerKg: v ?? 2 })} suffix="g/kg" step={0.1} />
        </Row>
        <Row label="지방" hint={w ? `하한 ${FAT_FLOOR_LABEL(profile.fatPerKg)} · ${fatFloor(profile)}g 아래로 내리지 않기` : '체중 1kg당'}>
          <NumberField value={profile.fatPerKg} onChange={(v) => save({ fatPerKg: v ?? 0.9 })} suffix="g/kg" step={0.05} />
        </Row>

        {w ? (
          <div className="mt-3 space-y-1.5 rounded-lg bg-zinc-950/60 p-3 text-xs tabular-nums">
            <p className="text-zinc-400">
              운동일 <span className="text-zinc-200">{training.kcal}kcal</span> · P{training.protein} C{training.carbs} F{training.fat}
            </p>
            <p className="text-zinc-400">
              휴식일 <span className="text-zinc-200">{rest.kcal}kcal</span> · P{rest.protein} C{rest.carbs} F{rest.fat}
            </p>
            <p className="text-zinc-600">단백질·지방은 고정되고 탄수화물이 남은 칼로리로 계산됩니다.</p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-amber-400/80">체중을 입력해야 매크로가 계산됩니다.</p>
        )}
      </Card>

      <SectionTitle>활동량</SectionTitle>
      <Card>
        <Row label="주간 운동 목표">
          <NumberField value={profile.weeklySessions} onChange={(v) => save({ weeklySessions: v ?? 3 })} suffix="회" />
        </Row>
        <Row label="쉬는 날 걸음 목표">
          <NumberField value={profile.stepGoal} onChange={(v) => save({ stepGoal: v ?? 8000 })} suffix="보" step={500} />
        </Row>
        <Row label="레그레이즈 단계" hint={LEG_RAISE_STAGES[profile.legRaiseStage - 1]?.label}>
          <NumberField value={profile.legRaiseStage} onChange={(v) => save({ legRaiseStage: Math.min(5, Math.max(1, v ?? 1)) })} suffix="/5" />
        </Row>
      </Card>

      <SectionTitle right={`${profile.safetyRules.length}개`}>안전 수칙</SectionTitle>
      <Card>
        <p className="mb-3 text-xs text-zinc-500">
          매 운동에 적용할 제약입니다. 등록하면 운동 화면 최상단에 항상 표시됩니다.
        </p>

        <div className="mb-3">
          <p className="mb-1.5 text-sm text-zinc-300">주의가 필요한 이력 · 상태</p>
          <TextField
            value={profile.conditionLabel ?? ''}
            onChange={(v) => save({ conditionLabel: v })}
            placeholder="예: 수술 이력, 디스크, 고혈압"
            className="w-full"
          />
        </div>

        {profile.safetyRules.length > 0 && (
          <ul className="mb-3 space-y-2">
            {profile.safetyRules.map((r, i) => (
              <li key={r.title} className="flex items-start gap-2 rounded-lg bg-zinc-950/60 p-3">
                <span className="text-xs tabular-nums text-zinc-600">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-200">{r.title}</p>
                  {r.desc && <p className="mt-0.5 text-xs text-zinc-500">{r.desc}</p>}
                </div>
                <button onClick={() => removeRule(r.title)} className="shrink-0 text-xs text-zinc-600 active:text-rose-400">
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}

        {unusedPresets.length > 0 && (
          <>
            <p className="mb-1.5 text-xs text-zinc-500">일반 수칙에서 고르기</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {unusedPresets.map((p) => (
                <button
                  key={p.title}
                  onClick={() => addRule(p)}
                  className="rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 active:bg-zinc-800"
                >
                  + {p.title}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="space-y-2">
          <TextField value={newRule.title} onChange={(v) => setNewRule({ ...newRule, title: v })} placeholder="직접 추가 — 수칙" className="w-full" />
          <TextField value={newRule.desc} onChange={(v) => setNewRule({ ...newRule, desc: v })} placeholder="설명 (선택)" className="w-full" />
          <Button
            variant="ghost"
            className="w-full"
            disabled={!newRule.title.trim()}
            onClick={() => {
              addRule(newRule)
              setNewRule({ title: '', desc: '' })
            }}
          >
            수칙 추가
          </Button>
        </div>
      </Card>

      <SectionTitle right={profile.trainerScript ? '직접 작성' : '자동 생성'}>트레이너 전달 문장</SectionTitle>
      <Card>
        <TextArea
          value={profile.trainerScript ?? ''}
          onChange={(v) => save({ trainerScript: v })}
          placeholder={buildTrainerScript({ ...profile, trainerScript: undefined }) || '위 항목을 채우면 자동으로 만들어집니다.'}
          rows={3}
        />
        <p className="mt-2 text-xs text-zinc-600">
          비워두면 이력·수칙을 조합해 자동으로 만들어집니다. 가이드 탭에서 탭 한 번으로 복사할 수 있습니다.
        </p>
      </Card>

      <SectionTitle>프로그램</SectionTitle>
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-zinc-200">12주 프로그램 시작일</p>
            <p className="mt-0.5 text-xs text-zinc-500">{startDate ? formatKo(startDate) : '미설정'}</p>
          </div>
          <input
            type="date"
            value={startDate ?? ''}
            onChange={(e) => setSetting('programStart', e.target.value || null)}
            className="rounded-md bg-zinc-950 px-2.5 py-2 text-sm text-zinc-100 outline-none ring-1 ring-zinc-800 placeholder:text-zinc-700 focus:ring-zinc-500"
          />
        </div>
      </Card>

      <SectionTitle>데이터</SectionTitle>
      <div className="space-y-2">
        <Card onClick={handleExport} className="active:bg-zinc-800">
          <span className="font-medium text-zinc-100">백업</span>
          <span className="mt-0.5 block text-xs text-zinc-500">프로필·기록 전체를 JSON으로 내보내기</span>
        </Card>

        <Card onClick={() => fileRef.current?.click()} className="active:bg-zinc-800">
          <span className="font-medium text-zinc-100">복원</span>
          <span className="mt-0.5 block text-xs text-zinc-500">백업 JSON 불러오기 (기존 데이터를 덮어씁니다)</span>
        </Card>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleImport(f)
            e.target.value = ''
          }}
        />

        <Card
          onClick={async () => {
            if (!confirm('프로필을 제외한 모든 기록을 삭제합니다. 되돌릴 수 없습니다.')) return
            await Promise.all([db.sessions.clear(), db.meals.clear(), db.daily.clear(), db.body.clear()])
            setMsg('전체 기록을 삭제했습니다.')
          }}
          className="border-transparent bg-zinc-900 active:bg-rose-950/40"
        >
          <span className="font-medium text-rose-300">전체 기록 삭제</span>
          <span className="mt-0.5 block text-xs text-rose-400/60">프로필은 유지됩니다</span>
        </Card>
      </div>

      {msg && <p className="mt-3 px-1 text-xs text-zinc-100">{msg}</p>}

      <div className="mt-6 flex items-center gap-2 px-1">
        <Pill>로컬 전용</Pill>
        <p className="text-[11px] text-zinc-600">
          입력한 신체·건강 정보는 서버로 전송되지 않고 이 브라우저에만 저장됩니다.
        </p>
      </div>
      <p className="mt-3 px-1 text-[11px] leading-relaxed text-zinc-600">
        기기를 바꾸거나 브라우저 데이터를 지우면 기록이 사라집니다. 주기적으로 백업을 받아두세요.
      </p>
    </>
  )
}

const FAT_FLOOR_LABEL = (perKg: number) => (perKg < 0.7 ? '⚠️ 0.7g/kg' : '0.7g/kg')

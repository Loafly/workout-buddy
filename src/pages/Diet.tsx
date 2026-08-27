import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import PageHeader from '../components/PageHeader'
import { Button, Card, Empty, NumberField, Pill, SectionTitle } from '../components/ui'
import { MEAL_PRESETS, NUTRITION_RULES, PROTEIN_REFERENCE } from '../data/nutrition'
import { fatFloor, isConfigured, macrosFor } from '../data/profile'
import { useProfile } from '../hooks/useProfile'
import { db, type Meal, type WorkoutSession } from '../db'
import { formatKo, toDateKey } from '../lib/date'

function MacroBar({
  label,
  value,
  target,
  unit,
  tone,
}: {
  label: string
  value: number
  target: number
  unit: string
  tone: string
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="tabular-nums text-zinc-300">
          {Math.round(value)}
          <span className="text-zinc-600">
            /{target}
            {unit}
          </span>
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const blank = { slot: '', desc: '', kcal: null, protein: null, carbs: null, fat: null }

export default function Diet() {
  const today = toDateKey()
  const [form, setForm] = useState<{
    slot: string
    desc: string
    kcal: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
  }>(blank)
  const [adding, setAdding] = useState(false)

  const { profile } = useProfile()
  const meals = useLiveQuery(() => db.meals.where('date').equals(today).toArray(), [today], [] as Meal[])
  const sessions = useLiveQuery(() => db.sessions.toArray(), [], [] as WorkoutSession[])
  const daily = useLiveQuery(() => db.daily.get(today), [today])

  const isTrainingDay = sessions.some((s) => s.date === today)
  const target = macrosFor(profile, isTrainingDay)

  const sum = meals.reduce(
    (a, m) => ({
      kcal: a.kcal + m.kcal,
      protein: a.protein + m.protein,
      carbs: a.carbs + m.carbs,
      fat: a.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const addPreset = (p: (typeof MEAL_PRESETS)[number]) =>
    db.meals.add({ date: today, ...p, createdAt: Date.now() })

  const addCustom = async () => {
    if (!form.desc.trim()) return
    await db.meals.add({
      date: today,
      slot: form.slot.trim() || '식사',
      desc: form.desc.trim(),
      kcal: form.kcal ?? 0,
      protein: form.protein ?? 0,
      carbs: form.carbs ?? 0,
      fat: form.fat ?? 0,
      createdAt: Date.now(),
    })
    setForm(blank)
    setAdding(false)
  }

  const patchDaily = (patch: Partial<NonNullable<typeof daily>>) =>
    db.daily.put({ ...(daily ?? { date: today }), date: today, ...patch })

  return (
    <>
      <PageHeader
        title="식단"
        sub={formatKo(today)}
        right={<Pill tone={isTrainingDay ? 'sky' : 'slate'}>{isTrainingDay ? '운동일' : '휴식일'}</Pill>}
      />

      {!isConfigured(profile) && (
        <Link
          to="/settings"
          className="mb-4 block border-l-2 border-amber-600/70 pl-3 text-[13px] text-zinc-400"
        >
          체중을 입력해야 목표 칼로리와 매크로가 계산됩니다. 설정에서 프로필 채우기 →
        </Link>
      )}

      <Card>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-3xl font-bold tabular-nums text-zinc-100">
            {Math.round(sum.kcal)}
          </span>
          <span className="text-sm text-zinc-500">
            / {target.kcal} kcal · 남은 {Math.max(0, target.kcal - Math.round(sum.kcal))}
          </span>
        </div>
        <div className="space-y-2.5">
          <MacroBar label="단백질" value={sum.protein} target={target.protein} unit="g" tone="bg-zinc-100" />
          <MacroBar label="탄수화물" value={sum.carbs} target={target.carbs} unit="g" tone="bg-zinc-400" />
          <MacroBar label="지방" value={sum.fat} target={target.fat} unit="g" tone="bg-zinc-600" />
        </div>
        {sum.protein < target.protein && target.protein > 0 && (
          <p className="mt-3 text-xs text-zinc-500">
            단백질 {Math.round(target.protein - sum.protein)}g 남음 — 끼니당 35~40g 기준
          </p>
        )}
        {target.fat > 0 && target.fat < fatFloor(profile) && (
          <p className="mt-2 text-xs text-amber-400/80">
            지방 목표가 하한(0.7g/kg = {fatFloor(profile)}g) 아래입니다. 호르몬에 영향이 갑니다.
          </p>
        )}
      </Card>

      <SectionTitle right={`${meals.length}개`}>오늘 먹은 것</SectionTitle>
      {meals.length === 0 ? (
        <Empty>아래 예시 식단을 눌러 바로 기록하거나 직접 입력하세요.</Empty>
      ) : (
        <ul className="space-y-2">
          {meals.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-lg bg-zinc-900/60 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-200">
                  <span className="text-zinc-500">{m.slot}</span> {m.desc}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-zinc-500">
                  {m.kcal}kcal · P{m.protein} C{m.carbs} F{m.fat}
                </p>
              </div>
              <button
                onClick={() => db.meals.delete(m.id!)}
                className="shrink-0 text-xs text-zinc-600 active:text-rose-400"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <SectionTitle>빠른 기록</SectionTitle>
      <div className="space-y-2">
        {MEAL_PRESETS.map((p) => (
          <Card key={p.slot} onClick={() => addPreset(p)} className="active:bg-zinc-800">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-200">
                  <span className="text-zinc-500">{p.slot}</span> {p.desc}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-zinc-500">
                  {p.kcal}kcal · P{p.protein} C{p.carbs} F{p.fat}
                </p>
              </div>
              <span className="shrink-0 text-lg text-zinc-400">+</span>
            </div>
          </Card>
        ))}
      </div>

      {adding ? (
        <div className="mt-3 space-y-2 rounded-lg bg-zinc-900/60 p-4">
          <div className="flex gap-2">
            <input
              value={form.slot}
              onChange={(e) => setForm({ ...form, slot: e.target.value })}
              placeholder="끼니 (예: 점심)"
              className="w-28 rounded-md bg-zinc-950 px-2.5 py-2 text-sm text-zinc-100 outline-none ring-1 ring-zinc-800 placeholder:text-zinc-700 focus:ring-zinc-500"
            />
            <input
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="내용"
              className="flex-1 rounded-md bg-zinc-950 px-2.5 py-2 text-sm text-zinc-100 outline-none ring-1 ring-zinc-800 placeholder:text-zinc-700 focus:ring-zinc-500"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <NumberField value={form.kcal} onChange={(v) => setForm({ ...form, kcal: v })} placeholder="kcal" />
            <NumberField value={form.protein} onChange={(v) => setForm({ ...form, protein: v })} placeholder="P" suffix="g" />
            <NumberField value={form.carbs} onChange={(v) => setForm({ ...form, carbs: v })} placeholder="C" suffix="g" />
            <NumberField value={form.fat} onChange={(v) => setForm({ ...form, fat: v })} placeholder="F" suffix="g" />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={addCustom}>
              추가
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" className="mt-3 w-full" onClick={() => setAdding(true)}>
          직접 입력
        </Button>
      )}

      <SectionTitle>오늘 컨디션</SectionTitle>
      <Card>
        <div className="flex items-center gap-3">
          <span className="flex-1 text-sm text-zinc-300">수면</span>
          <NumberField
            value={daily?.sleepHours ?? null}
            onChange={(v) => patchDaily({ sleepHours: v ?? undefined })}
            placeholder="시간"
            suffix="h"
            step={0.5}
            className="w-28"
          />
        </div>
        <label className="mt-3 flex items-center gap-3">
          <input
            type="checkbox"
            checked={daily?.alcohol ?? false}
            onChange={(e) => patchDaily({ alcohol: e.target.checked })}
            className="h-4 w-4 accent-rose-500"
          />
          <span className="flex-1 text-sm text-zinc-300">음주</span>
        </label>
        {(daily?.sleepHours != null && daily.sleepHours < 6) || daily?.alcohol ? (
          <p className="mt-3 rounded-lg bg-zinc-900 p-2.5 text-xs text-rose-300">
            {daily?.alcohol && '술은 지방 산화를 직접 억제하고 내장지방과 상관관계가 가장 높습니다. '}
            {daily?.sleepHours != null &&
              daily.sleepHours < 6 &&
              '수면 6시간 미만은 코르티솔을 올려 복부 축적 + 회복 저해로 이어집니다.'}
          </p>
        ) : null}
      </Card>

      <SectionTitle>원칙</SectionTitle>
      <ul className="space-y-1.5 rounded-lg bg-zinc-900/40 p-4 text-xs text-zinc-400">
        {NUTRITION_RULES.map((r) => (
          <li key={r} className="flex gap-1.5">
            <span className="text-zinc-700">—</span>
            {r}
          </li>
        ))}
      </ul>

      <SectionTitle>단백질 참고</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {PROTEIN_REFERENCE.map(([food, g]) => (
          <div key={food} className="rounded-lg bg-zinc-900/40 px-3 py-2.5">
            <p className="text-xs text-zinc-400">{food}</p>
            <p className="text-sm font-semibold tabular-nums text-zinc-200">{g}g</p>
          </div>
        ))}
      </div>
    </>
  )
}

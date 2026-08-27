import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import PageHeader from '../components/PageHeader'
import { Card, SectionTitle } from '../components/ui'
import { db, exportAll, getSetting, importAll, setSetting } from '../db'
import { formatKo, toDateKey } from '../lib/date'

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const startDate = useLiveQuery(() => getSetting<string | null>('programStart', null), [], null)

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

  return (
    <>
      <PageHeader title="설정" sub="데이터는 이 기기에만 저장됩니다" />

      <SectionTitle>프로그램</SectionTitle>
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-slate-200">12주 프로그램 시작일</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {startDate ? formatKo(startDate) : '미설정'}
            </p>
          </div>
          <input
            type="date"
            value={startDate ?? ''}
            onChange={(e) => setSetting('programStart', e.target.value || null)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
          />
        </div>
      </Card>

      <SectionTitle>데이터</SectionTitle>
      <div className="space-y-2">
        <Card onClick={handleExport} className="active:bg-slate-800">
          <span className="font-medium text-slate-100">백업</span>
          <span className="mt-0.5 block text-xs text-slate-500">JSON 파일로 내보내기</span>
        </Card>

        <Card onClick={() => fileRef.current?.click()} className="active:bg-slate-800">
          <span className="font-medium text-slate-100">복원</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            백업 JSON 불러오기 (기존 데이터를 덮어씁니다)
          </span>
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
            if (!confirm('모든 기록을 삭제합니다. 되돌릴 수 없습니다.')) return
            await Promise.all([db.sessions.clear(), db.meals.clear(), db.daily.clear(), db.body.clear()])
            setMsg('전체 기록을 삭제했습니다.')
          }}
          className="border-rose-900/60 bg-rose-950/20 active:bg-rose-950/40"
        >
          <span className="font-medium text-rose-300">전체 기록 삭제</span>
          <span className="mt-0.5 block text-xs text-rose-400/60">되돌릴 수 없습니다</span>
        </Card>
      </div>

      {msg && <p className="mt-3 px-1 text-xs text-sky-400">{msg}</p>}

      <p className="mt-8 px-1 text-[11px] leading-relaxed text-slate-600">
        기기를 바꾸거나 브라우저 데이터를 지우면 기록이 사라집니다. 주기적으로 백업을 받아두세요.
      </p>
    </>
  )
}

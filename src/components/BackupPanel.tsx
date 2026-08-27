import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button, Card, DraftTextArea, SectionTitle } from './ui'
import { exportAll, importAll, type Backup } from '../db'
import { copyToClipboard, exportBackup, ExportCancelled, summarize } from '../lib/backup'
import { toDateKey } from '../lib/date'

interface Pending {
  data: Backup
  found: string
  source: string
}

export default function BackupPanel() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState(false)
  const [pasting, setPasting] = useState(false)
  const [pasted, setPasted] = useState('')
  const [pending, setPending] = useState<Pending | null>(null)

  // 공유 시트는 사용자 제스처 안에서 바로 호출해야 해서 미리 만들어 둡니다
  const backup = useLiveQuery(() => exportAll(), [], null)
  const json = useMemo(() => (backup ? JSON.stringify(backup, null, 2) : ''), [backup])
  const counts = backup ? summarize(backup) : null
  const total = counts?.reduce((n, [, c]) => n + c, 0) ?? 0
  const filename = `운동기록-${toDateKey()}.json`

  const say = (text: string, isErr = false) => {
    setMsg(text)
    setErr(isErr)
  }

  const handleExport = () => {
    if (!json) return
    exportBackup(json, filename)
      .then((method) =>
        say(
          method === 'share'
            ? '공유 시트에서 "파일에 저장"을 고르면 됩니다.'
            : `${filename} 을 내려받았습니다.`,
        ),
      )
      .catch((e) => {
        if (e instanceof ExportCancelled) return
        say('내보내기에 실패했습니다. 아래 "텍스트로 주고받기"를 써주세요.', true)
      })
  }

  const handleCopy = () =>
    copyToClipboard(json).then(
      () => say('클립보드에 복사했습니다. 메모 앱 등에 붙여넣어 보관하세요.'),
      () => say('복사에 실패했습니다.', true),
    )

  /** 파싱·요약만 하고 실제 덮어쓰기는 확인을 받은 뒤에 */
  const stage = (text: string, source: string) => {
    let data: Backup
    try {
      data = JSON.parse(text)
    } catch {
      return say(`${source}: JSON 형식이 아닙니다.`, true)
    }
    if (!Array.isArray(data?.sessions)) {
      return say(`${source}: 이 앱의 백업 파일이 아닙니다.`, true)
    }
    const found =
      summarize(data)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${k} ${n}건`)
        .join(', ') || '빈 백업'
    setMsg('')
    setPending({ data, found, source })
  }

  const commit = async () => {
    if (!pending) return
    try {
      await importAll(pending.data)
      say(`복원했습니다 — ${pending.found}`)
      setPasted('')
      setPasting(false)
    } catch (e) {
      say(`복원 실패: ${e instanceof Error ? e.message : '파일을 확인해주세요.'}`, true)
    }
    setPending(null)
  }

  return (
    <>
      <SectionTitle right={counts ? counts.map(([k, n]) => `${k} ${n}`).join(' · ') : undefined}>
        데이터
      </SectionTitle>

      <div className="space-y-2">
        <Card onClick={handleExport}>
          <span className="font-medium text-zinc-100">내보내기</span>
          <span className="mt-0.5 block text-xs text-zinc-500">
            {total > 0
              ? 'JSON 파일 하나로 저장 — 아이폰에서는 공유 시트가 열립니다'
              : '아직 저장된 기록이 없습니다'}
          </span>
        </Card>

        <Card onClick={() => fileRef.current?.click()}>
          <span className="font-medium text-zinc-100">파일에서 불러오기</span>
          <span className="mt-0.5 block text-xs text-zinc-500">지금 기록을 덮어씁니다</span>
        </Card>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) stage(await f.text(), f.name)
          }}
        />

        <div className="rounded-lg bg-zinc-900/70 p-4">
          <button onClick={() => setPasting((v) => !v)} className="w-full text-left">
            <span className="font-medium text-zinc-100">텍스트로 주고받기</span>
            <span className="mt-0.5 block text-xs text-zinc-500">
              파일 저장이 막히는 환경용 — 복사해서 메모에 붙여넣거나, 붙여넣어 복원
            </span>
          </button>

          {pasting && (
            <div className="mt-3 space-y-2">
              <Button variant="ghost" className="w-full" onClick={handleCopy} disabled={!json}>
                지금 기록 복사하기
              </Button>
              <DraftTextArea
                value={pasted}
                onChange={setPasted}
                placeholder="여기에 백업 JSON을 붙여넣으세요"
                rows={4}
              />
              <Button
                className="w-full"
                disabled={!pasted.trim()}
                onClick={() => stage(pasted, '붙여넣기')}
              >
                붙여넣은 내용으로 복원
              </Button>
            </div>
          )}
        </div>
      </div>

      {pending && (
        <div className="mt-2 border-l-2 border-amber-600/70 py-2 pl-3">
          <p className="text-sm text-zinc-200">불러올 내용: {pending.found}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {pending.source} · 지금 기록을 전부 덮어씁니다. 되돌릴 수 없습니다.
          </p>
          <div className="mt-2.5 flex gap-2">
            <Button className="flex-1" onClick={commit}>
              덮어쓰기
            </Button>
            <Button variant="ghost" onClick={() => setPending(null)}>
              취소
            </Button>
          </div>
        </div>
      )}

      {msg && <p className={`mt-3 text-xs ${err ? 'text-rose-400' : 'text-zinc-400'}`}>{msg}</p>}
    </>
  )
}

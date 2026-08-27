import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Exercise } from '../data/program'
import { db } from '../db'
import { normalizeUrl, searchEn, searchKo, thumbnail } from '../lib/links'

/**
 * 종목별 참고 영상.
 * 기본은 유튜브 검색으로 보내고, 마음에 든 영상을 저장하면 다음부터 바로 열립니다.
 */
export default function ExerciseVideo({ exercise }: { exercise: Exercise }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const [thumbFailed, setThumbFailed] = useState(false)

  const link = useLiveQuery(() => db.links.get(exercise.id), [exercise.id])
  // 썸네일은 유튜브에서 받아오므로 오프라인이면 실패할 수 있습니다
  const thumb = link && !thumbFailed ? thumbnail(link.url) : null

  const save = async () => {
    const url = normalizeUrl(draft)
    if (!url) return setError('주소를 확인해주세요')
    await db.links.put({ exerciseId: exercise.id, url })
    setThumbFailed(false)
    setDraft('')
    setError('')
    setEditing(false)
  }

  const remove = async () => {
    await db.links.delete(exercise.id)
    setEditing(false)
  }

  return (
    <div className="mt-3 space-y-2">
      {link && (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md bg-zinc-950 p-2"
        >
          {thumb ? (
            <img
              src={thumb}
              alt=""
              loading="lazy"
              onError={() => setThumbFailed(true)}
              className="h-11 w-20 shrink-0 rounded bg-zinc-900 object-cover"
            />
          ) : (
            <span className="flex h-11 w-20 shrink-0 items-center justify-center rounded bg-zinc-900 text-zinc-600">
              ▶
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-zinc-300">저장한 영상 열기</span>
            <span className="block truncate text-[11px] text-zinc-600">{link.url}</span>
          </span>
        </a>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
        <a
          href={searchKo(exercise)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 underline underline-offset-4"
        >
          유튜브 검색
        </a>
        <a
          href={searchEn(exercise)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 underline underline-offset-4"
        >
          영어로 검색
        </a>
        <button
          onClick={() => {
            setEditing((v) => !v)
            setDraft(link?.url ?? '')
            setError('')
          }}
          className="ml-auto text-zinc-500"
        >
          {editing ? '닫기' : link ? '영상 바꾸기' : '영상 저장'}
        </button>
      </div>

      {editing && (
        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            <input
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                setError('')
              }}
              placeholder="유튜브 주소 붙여넣기"
              inputMode="url"
              className="min-w-0 flex-1 rounded-md bg-zinc-950 px-2.5 py-2 text-xs text-zinc-100 outline-none ring-1 ring-zinc-800 placeholder:text-zinc-700 focus:ring-zinc-500"
            />
            <button
              onClick={save}
              disabled={!draft.trim()}
              className="shrink-0 rounded-md bg-zinc-100 px-3 text-xs font-medium text-zinc-950 disabled:opacity-30"
            >
              저장
            </button>
          </div>
          {error && <p className="text-[11px] text-rose-400">{error}</p>}
          {link && (
            <button onClick={remove} className="text-[11px] text-zinc-600">
              저장한 영상 지우기
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export type ExportMethod = 'share' | 'download' | 'clipboard'

export class ExportCancelled extends Error {}

/**
 * 백업 파일 내보내기.
 *
 * iOS 홈 화면 앱(standalone)에서는 <a download> 가 동작하지 않습니다.
 * 공유 시트(Web Share API)를 먼저 시도하고, 안 되면 다운로드로 폴백합니다.
 *
 * 주의: navigator.share 는 사용자 제스처 안에서 호출해야 합니다.
 * 그래서 json 은 미리 만들어둔 문자열을 받습니다 (await 후 호출하면 Safari가 거부).
 */
export async function exportBackup(json: string, filename: string): Promise<ExportMethod> {
  const type = 'application/json'

  if (typeof File !== 'undefined' && navigator.canShare) {
    const file = new File([json], filename, { type })
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename })
        return 'share'
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') throw new ExportCancelled()
        // 그 밖의 실패는 아래 다운로드로 폴백
      }
    }
  }

  const url = URL.createObjectURL(new Blob([json], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'download'
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  return 'clipboard' as const
}

/** 백업 내용 요약 — 덮어쓰기 전에 무엇이 들어오는지 보여주기 위함 */
export function summarize(data: {
  sessions?: unknown[]
  meals?: unknown[]
  daily?: unknown[]
  body?: unknown[]
}) {
  return [
    ['운동', data.sessions?.length ?? 0],
    ['식사', data.meals?.length ?? 0],
    ['컨디션', data.daily?.length ?? 0],
    ['체중', data.body?.length ?? 0],
  ] as const
}

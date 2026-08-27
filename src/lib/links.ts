import type { Exercise } from '../data/program'

/**
 * 종목별 참고 영상은 특정 영상 ID를 코드에 박아두지 않습니다.
 * 링크가 쉽게 깨지고, 어떤 영상이 좋은지는 사람마다 다르기 때문에
 * 검색으로 연결하고 마음에 든 영상을 저장해 쓰는 방식입니다.
 */

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`

export const searchKo = (ex: Exercise) => yt(`${ex.name} 자세`)
export const searchEn = (ex: Exercise) => yt(`${ex.en} form`)

/** 유튜브 주소에서 영상 ID를 뽑아 썸네일을 만든다 (없으면 null) */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null
    if (!u.hostname.endsWith('youtube.com')) return null
    if (u.pathname === '/watch') return u.searchParams.get('v')
    const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)
    return m?.[1] ?? null
  } catch {
    return null
  }
}

export const thumbnail = (url: string) => {
  const id = youtubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null
}

/** 붙여넣은 값이 열 수 있는 주소인지 */
export function normalizeUrl(input: string): string | null {
  const t = input.trim()
  if (!t) return null
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`
  try {
    const u = new URL(withScheme)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null
  } catch {
    return null
  }
}

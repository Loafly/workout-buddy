import { useLiveQuery } from 'dexie-react-hooks'
import { getSetting, setSetting } from '../db'
import { normalize, type Profile } from '../data/profile'

export function useProfile() {
  const raw = useLiveQuery(() => getSetting<Partial<Profile> | null>('profile', null), [], null)
  const profile = normalize(raw)
  const save = (patch: Partial<Profile>) => setSetting('profile', { ...profile, ...patch })
  return { profile, save, loaded: raw !== undefined }
}

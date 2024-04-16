import { signal, persist, type StorageAPI } from '..'
import { useSubscribable } from './use-state.react'

export const usePersistedSignal = <T>(initial: () => T, storage: StorageAPI<T>) => {
  const raw = persist(signal(initial), storage)
  const state = useSubscribable(raw)
  return [state, raw.set]
}

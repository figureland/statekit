import { signal, persist, type StorageAPI } from '@figureland/statekit'
import { useSubscribable } from './use-subscribable.react'

export const usePersistedSignal = <T>(initial: () => T, storage: StorageAPI<T>) => {
  const raw = persist(signal(initial), storage)
  const state = useSubscribable(raw)
  return [state, raw.set]
}

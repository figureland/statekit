import { signal, persist, type StorageAPI } from '..'
import { useWritableSignal } from './use-state.svelte'

export const usePersistedSignal = <T>(initial: () => T, storage: StorageAPI<T>) =>
  useWritableSignal(persist(signal(initial), storage))

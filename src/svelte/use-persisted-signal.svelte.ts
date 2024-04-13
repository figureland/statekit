import { signal, persist, type PersistenceOptions, type Signal } from '..'
import { useWritableSignal } from './use-state.svelte'

export const usePersistedSignal = <T>(initial: () => T, options: PersistenceOptions<Signal<T>>) =>
  useWritableSignal(persist(signal(initial), options))

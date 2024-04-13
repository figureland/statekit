import { signal, persist, type PersistenceOptions, type Signal } from '..'
import { useSubscribable } from './use-state.react'

export const usePersistedSignal = <T>(initial: () => T, options: PersistenceOptions<Signal<T>>) => {
  const raw = persist(signal(initial), options)
  const state = useSubscribable(raw)
  return [state, raw.set]
}

import { signal, persist, type PersistenceOptions, type Signal } from '..'
import { useSubscribable } from './use-state.vue'

export const usePersistedSignal = <T>(initial: () => T, options: PersistenceOptions<Signal<T>>) =>
  useSubscribable(persist(signal(initial), options))

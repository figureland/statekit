import { signal, persist, type StorageAPI } from '@figureland/statekit'
import { useSubscribable } from './use-subscribable.vue'

export const usePersistedSignal = <T>(initial: () => T, storage: StorageAPI<T>) =>
  useSubscribable(persist(signal(initial), storage))

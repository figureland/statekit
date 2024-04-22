import { customRef } from 'vue'
import { signal, type UseSignalDependency, type Subscribable } from '@figureland/statekit'

export const useSubscribable = <S>(subscribable: Subscribable<S>) =>
  customRef<S>((track, set) => ({
    get: () => {
      track()
      return subscribable.get()
    },
    set,
    dispose: subscribable.on(set)
  }))

export const useDerived = <R>(fn: (use: UseSignalDependency) => R) => useSubscribable(signal(fn))

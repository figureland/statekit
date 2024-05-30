import { customRef, onScopeDispose } from 'vue'
import { signal, type UseSignalDependency, type Gettable } from '@figureland/statekit'

export const useSubscribable = <S>(subscribable: Gettable<S>) =>
  customRef<S>((track, set) => {
    const unsubscribe = subscribable.on(set)
    onScopeDispose(unsubscribe)
    return {
      get: () => {
        track()
        return subscribable.get()
      },
      set,
      dispose: unsubscribe
    }
  })

export const useDerived = <R>(fn: (use: UseSignalDependency) => R) => useSubscribable(signal(fn))

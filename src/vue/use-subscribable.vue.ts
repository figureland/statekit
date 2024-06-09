import { customRef, onScopeDispose } from 'vue'
import type { Gettable } from '@figureland/statekit'

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

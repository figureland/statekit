import type { Gettable } from '@figureland/statekit'

export const useSubscribable = <S>(s: Gettable<S>) => ({
  subscribe: (run: (value: S) => void) => {
    const unsub = s.on(run)
    run(s.get())
    return unsub
  }
})

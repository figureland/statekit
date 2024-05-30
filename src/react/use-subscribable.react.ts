import { useSyncExternalStore } from 'react'
import { signal, type Gettable } from '@figureland/statekit'

export const useSubscribable = <S>(s: Gettable<S>) => useSyncExternalStore<S>(s.on, s.get)

export const useDerived = <R>(fn: () => R) => useSubscribable(signal(fn))

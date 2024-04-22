import { useSyncExternalStore } from 'react'
import { signal, type Subscribable } from '@figureland/statekit'

export const useSubscribable = <S>(s: Subscribable<S>) => useSyncExternalStore<S>(s.on, s.get)

export const useDerived = <R>(fn: () => R) => useSubscribable(signal(fn))

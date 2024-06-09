import { useSyncExternalStore } from 'react'
import type { Gettable } from '@figureland/statekit'

export const useSubscribable = <S>(s: Gettable<S>) => useSyncExternalStore<S>(s.on, s.get)

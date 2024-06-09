import { useSyncExternalStore } from 'react'
import type { Gettable, GettableType } from '@figureland/statekit'

export const useSubscribable = <S extends Gettable<any>>(s: S) =>
  useSyncExternalStore<GettableType<S>>(s.on, s.get)

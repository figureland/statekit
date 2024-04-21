import { useSyncExternalStore } from 'react'
import { isString } from '@figureland/typekit'
import { type State, signal, type Subscribable } from '@figureland/statekit'

export const useSubscribable = <S>(s: Subscribable<S>) => useSyncExternalStore<S>(s.on, s.get)

export const useState = <S extends object, K extends keyof S | undefined = undefined>(
  state: State<S>,
  key?: K
) =>
  (isString(key)
    ? (useSubscribable(state.key(key)) as K extends keyof S ? S[K] : never)
    : useSyncExternalStore<S>(state.on, state.get)) as K extends keyof S ? S[K] : S

export const useDerived = <R>(fn: () => R) => useSubscribable(signal(fn))

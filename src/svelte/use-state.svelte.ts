import { isString } from '@figureland/typekit'
import { type State, type Signal, signal, Subscribable } from '..'

export const useSubscribable = <S>(subscribable: Subscribable<S>) => ({
  subscribe: (run: (value: S) => void) => {
    const unsub = subscribable.on(run)
    run(subscribable.get())
    return unsub
  }
})

export const useReadableSignal = <S>(signal: Signal<S>) => ({
  subscribe: (run: (value: S) => void) => {
    const unsub = signal.on(run)
    run(signal.get())
    return unsub
  }
})

export const useWritableSignal = <S>(signal: Signal<S>) => ({
  ...useReadableSignal(signal),
  set: signal.set
})

export const useState = <S extends object, K extends keyof S | undefined = undefined>(
  state: State<S>,
  key?: K
) =>
  (isString(key)
    ? (useReadableSignal(state.key(key)) as K extends keyof S ? S[K] : never)
    : {
        subscribe: (run: (value: S) => void) => {
          const unsub = state.on(run)
          run(state.get())
          return unsub
        }
      }) as K extends keyof S ? S[K] : S

export const useDerived = <R>(fn: () => R) => useReadableSignal(signal(fn))

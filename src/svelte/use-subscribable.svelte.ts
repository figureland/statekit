import { type Signal, signal, type Subscribable } from '@figureland/statekit'

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

export const useDerived = <R>(fn: () => R) => useReadableSignal(signal(fn))

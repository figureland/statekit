import type { Disposable } from '..'
import { createSubscriptions } from './subscriptions'

export const manager = () => {
  const subs = createSubscriptions()

  const use = <S extends Disposable | (() => void)>(s: S) => {
    subs.add('dispose' in s ? s.dispose : s)
    return s
  }

  const dispose = () => {
    subs.each()
    subs.dispose()
  }

  return {
    use,
    dispose
  }
}

export const disposable = (fn: () => void): Disposable => ({ dispose: fn })

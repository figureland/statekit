import { NiceMap } from '@figureland/typekit'
import type { Disposable, Manager, Subscribable } from '..'
import { createSubscriptions } from './subscriptions'

export const manager = (): Manager => {
  const keyedSubs = new NiceMap()
  const subs = createSubscriptions()

  const use = <S extends Disposable | (() => void)>(s: S) => {
    subs.add('dispose' in s ? s.dispose : s)
    return s
  }

  const unique = <S extends Subscribable>(key: string, s: () => S) =>
    use(keyedSubs.getOrSet(key, s))

  const dispose = () => {
    subs.each()
    subs.dispose()
  }

  return {
    unique,
    use,
    dispose
  }
}

export const disposable = (fn: () => void): Disposable => ({ dispose: fn })

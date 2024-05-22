import { NiceMap } from '@figureland/typekit'
import type { Disposable, System, Subscribable } from '.'
import { createSubscriptions } from './utils/subscriptions'

export const system = (): System => {
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
    keyedSubs.clear()
  }

  return {
    unique,
    use,
    dispose
  }
}

export const disposable = (fn: () => void): Disposable => ({ dispose: fn })

export class SystemInstance {
  protected readonly system = system()
  public readonly use = this.system.use
  public readonly unique = this.system.unique
  public readonly dispose = this.system.dispose
}

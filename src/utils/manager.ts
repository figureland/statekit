import type { Disposable } from '..'
import { createSubscriptions } from './subscriptions'

export const manager = () => {
  const subs = createSubscriptions()

  const use = <S extends Disposable>(s: S) => {
    subs.add(s.dispose)
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

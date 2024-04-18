import type { Subscribable } from '..'
import { createSubscriptions } from './subscriptions'

export const manager = () => {
  const subs = createSubscriptions()

  const use = <S extends Subscribable>(s: S) => {
    subs.add(s.dispose)
    return s
  }

  return {
    use,
    dispose: subs.dispose
  }
}

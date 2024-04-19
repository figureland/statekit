import type { Disposable } from '..'
import { createSubscriptions } from './subscriptions'

export const manager = () => {
  const subs = createSubscriptions()

  const use = <S extends Disposable>(...ds: S[]) => {
    for (const disposable of ds) {
      subs.add(disposable.dispose)
    }

    return ds
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

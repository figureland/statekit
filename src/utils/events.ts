import { entries } from '@figureland/typekit'
import {
  createSubscriptions,
  createTopicSubscriptions,
  type Subscription,
  type Unsubscribe
} from './subscriptions'

export type Events<S extends Record<string, any>, K extends string & keyof S = string & keyof S> = {
  on: (
    key: K | '*' | Partial<{ [Key in K]: (eventArg: S[Key]) => void }>,
    sub?: Subscription<any>
  ) => Unsubscribe
  emit: <Key extends K = K>(key: Key, value: S[Key]) => void
  dispose: () => void
  size: () => number
}

/**
 * Creates a new event emitter
 */
export const createEvents = <
  S extends Record<string, any>,
  K extends string & keyof S = string & keyof S
>(): Events<S, K> => {
  const subs = createTopicSubscriptions()
  const all = createSubscriptions()

  /**
   * Subscribe to a specific event, to all events using '*', or to multiple events
   */
  const on = (
    key: K | '*' | Partial<{ [Key in K]: (eventArg: S[Key]) => void }>,
    sub?: Subscription<any>
  ): Unsubscribe => {
    if (typeof key === 'string') {
      if (key === '*') {
        return all.add(sub!)
      }
      return subs.add(key, sub!)
    } else {
      const listeners = key as Partial<{ [Key in K]: (eventArg: S[Key]) => void }>
      const unsubscribes = (entries(listeners) as [K, (eventArg: S[K]) => void][]).map((listener) =>
        subs.add(listener[0], listener[1])
      )

      return () => {
        for (const unsubscribe of unsubscribes) {
          unsubscribe()
        }
      }
    }
  }

  return {
    on,
    emit: <Key extends K = K>(key: Key, value: S[Key]) => {
      subs.each(key, value)
      all.each([key, value])
    },
    dispose: () => {
      all.dispose()
      subs.dispose()
    },
    size: () => {
      return all.size() + subs.size()
    }
  }
}

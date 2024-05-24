import { entries } from '@figureland/typekit'
import {
  createSubscriptions,
  createTopicSubscriptions,
  type Subscription,
  type Unsubscribe
} from './subscriptions'

export type Events<S extends Record<string, any>, K extends string & keyof S = string & keyof S> = {
  on: <Key extends K = K>(key: Key, sub: Subscription<S[Key]>) => Unsubscribe
  onAll: (sub: Subscription<{ [Key in K]: [Key, S[Key]] }[K]>) => Unsubscribe
  onMany: (listeners: { [Key in K]: (eventArg: S[Key]) => void }) => Unsubscribe
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
   * Subscribe to a specific event
   */
  const on = <Key extends K = K>(key: Key, sub: Subscription<S[Key]>) => subs.add(key, sub)

  return {
    on,
    onMany: (listeners: { [Key in K]: (eventArg: S[Key]) => void }): Unsubscribe => {
      const unsubscribes = (entries(listeners) as [K, (eventArg: S[K]) => void][]).map((listener) =>
        on(...listener)
      )

      return () => {
        for (const unsubscribe of unsubscribes) {
          unsubscribe()
        }
      }
    },
    onAll: (sub: Subscription<{ [Key in K]: [Key, S[Key]] }[K]>) => all.add(sub),
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

import { entries } from '@figureland/typekit/object'
import { isString, isNumber, isSymbol } from '@figureland/typekit/guards'
import {
  createSubscriptions,
  createTopicSubscriptions,
  type Subscription,
  type Unsubscribe
} from './subscriptions'

type EventKey = string | number | symbol
type EventMap = Record<EventKey, any>

export type Events<S extends EventMap, K extends keyof S = EventKey & keyof S> = {
  on: <Key extends K>(
    key: Key | Partial<{ [Key in K]: (eventArg: S[Key]) => void }>,
    sub?: Subscription<S[Extract<Key, K>]>
  ) => Unsubscribe
  all: (sub: Subscription<[K, S[K]]>) => Unsubscribe
  emit: <Key extends K>(key: Key, value: S[Key]) => void
  dispose: () => void
  size: () => number
}

/**
 * Creates a new event emitter
 */
export const createEvents = <
  S extends EventMap,
  K extends EventKey & keyof S = EventKey & keyof S
>(): Events<S, K> => {
  const subs = createTopicSubscriptions<K>()
  const allSubs = createSubscriptions<Subscription<[K, S[K]]>>()

  /**
   * Subscribe to a specific event, to all events using '*', or to multiple events
   */
  const on: Events<S, K>['on'] = (key, sub) => {
    if (isString(key) || isSymbol(key) || isNumber(key)) {
      return subs.add(key as K, sub as Subscription<S[typeof key]>)
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

  const all = (sub: Subscription<[K, S[K]]>) => {
    return allSubs.add(sub)
  }

  return {
    on,
    emit: <Key extends K>(key: Key, value: S[Key]) => {
      subs.each(key, value)
      allSubs.each([key, value])
    },
    all,
    dispose: () => {
      allSubs.dispose()
      subs.dispose()
    },
    size: () => {
      return allSubs.size() + subs.size()
    }
  }
}

export async function* iterate<
  S extends Record<string, any>,
  K extends keyof S = EventKey & keyof S,
  Key extends K = K
>(events: Events<S, K>, name: Key): AsyncIterableIterator<S[Extract<Key, K>]> {
  let resolve: (value: S[Extract<Key, K>]) => void
  let promise = new Promise<S[Extract<Key, K>]>((r) => (resolve = r))

  const unsubscribe = events.on(name, (value) => {
    resolve(value)
    promise = new Promise<S[Extract<Key, K>]>((r) => (resolve = r))
  })

  try {
    while (true) {
      yield await promise
    }
  } finally {
    unsubscribe()
  }
}

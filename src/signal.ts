import { isFunction, isObject, isMap, isSet } from '@figureland/typekit/guards'
import { shallowEquals, type Equals } from '@figureland/typekit/equals'
import { type Merge, simpleMerge } from '@figureland/typekit/merge'
import { type Subscription } from './utils/subscriptions'
import { createEvents } from './utils/events'
import type { Signal, SubscribableEvents, UseSignalDependency } from './api'
import { system } from './system'

export const createSignalContext = () => {
  let id: number = 0

  const register = () => {
    id++
    return id.toString()
  }

  return {
    /**
     * Creates new {@link Signal}
     */
    signal: <V>(
      fn: V | ((use: UseSignalDependency) => V),
      options: SignalOptions<V> = {}
    ): Signal<V> => createSignal<V>(register(), fn, options)
  }
}

export const { signal } = createSignalContext()

/**
 * Creates a simple {@link Signal} for tracking a value
 */
const createSignal = <V>(
  id: string,
  initial: V | ((use: UseSignalDependency) => V),
  { merge = simpleMerge, equality = shallowEquals, throttle, track = false }: SignalOptions<V>
): Signal<V> => {
  const { dispose, use } = system()
  const dependencies = new Set<Signal<any>['on']>()

  const events = use(createEvents<SubscribableEvents<V>>())
  let loaded = track
  let lastSyncTime: number = 0

  const shouldThrottle = () => throttle && performance.now() - lastSyncTime < throttle

  const handleDependency: UseSignalDependency = (s) => {
    if (!loaded) dependencies.add(s.on)
    return s.get()
  }

  let value = isFunction(initial) ? initial(handleDependency) : initial

  loaded = true

  const mutate = (u: (value: V) => void, sync: boolean = true) => {
    if (shouldThrottle()) return
    u(value)
    if (sync) events.emit('state', value)
    lastSyncTime = performance.now()
  }

  const set = (v: V | Partial<V> | ((v: V) => V | Partial<V>), forceSync?: boolean): void => {
    if (shouldThrottle()) return
    const next = isFunction(v) ? (v as (v: V) => V)(value) : v
    const shouldMerge = isObject(next) && !isMap(next) && !isSet(next)
    const newValue = shouldMerge && isObject(value) ? (merge(value, next) as V) : (next as V)
    if (!equality || !equality(value, newValue) || forceSync) {
      lastSyncTime = performance.now()
      value = newValue
      events.emit('state', value)
      events.emit('previous', [lastSyncTime, value])
    }
  }

  if (isFunction(initial)) {
    for (const dep of dependencies) {
      dep(() => set(initial(handleDependency)))
    }
  }

  const on = (sub: Subscription<V>) => events.on('state', sub)

  return {
    id,
    set,
    on,
    mutate,
    get: () => value,
    events,
    dispose: () => {
      events.emit('dispose', true)
      dependencies.clear()
      dispose()
    },
    use
  }
}

export type SignalOptions<R> = {
  track?: boolean
  equality?: Equals<R>
  merge?: Merge
  throttle?: number
}

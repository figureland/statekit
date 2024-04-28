import {
  type Merge,
  isArray,
  isFunction,
  isObject,
  isMap,
  isSet,
  simpleMerge
} from '@figureland/typekit'
import { createSubscriptions, type Subscription, type Unsubscribe } from './utils/subscriptions'
import { shallowEquals, type Equals } from './utils/equals'
import { createEvents } from './utils/events'
import type { Signal, UseSignalDependency } from './api'

const createSignalContext = () => {
  let id: number = 0

  return {
    register: () => {
      id++
      return id.toString()
    }
  }
}

const context = createSignalContext()

export const signal = <R>(
  fn: (use: UseSignalDependency) => R,
  options: SignalOptions<R> = {}
): Signal<R> => {
  const id = context.register()
  const s = createSignal<R>(id, fn, options)
  return s
}

/**
 * Creates a simple {@link Signal} for tracking a store.value
 */
const createSignal = <V>(
  id: string,
  initial: (use: UseSignalDependency) => V,
  { merge = simpleMerge, equality = shallowEquals, throttle }: SignalOptions<V>
): Signal<V> => {
  const dependencies = new Set<Signal<any>['on']>()
  const subs = createSubscriptions()
  const e = createEvents<{ state: V; dispose: true }>()
  let loaded = false
  let lastSyncTime: number = 0

  const shouldThrottle = () => throttle && performance.now() - lastSyncTime < throttle

  const handleDependency: UseSignalDependency = (s) => {
    if (!loaded) dependencies.add(s.on)
    return s.get()
  }

  let value = initial(handleDependency)

  loaded = true

  const mutate = (u: (value: V) => void, sync: boolean = true) => {
    if (shouldThrottle()) return
    u(value)
    if (sync) e.emit('state', value)
    lastSyncTime = performance.now()
  }

  const set = (v: V | Partial<V> | ((v: V) => V | Partial<V>), sync: boolean = true): void => {
    if (shouldThrottle()) return
    const next = isFunction(v) ? (v as (v: V) => V)(value) : v
    const shouldMerge = isObject(next) && !isMap(next) && !isSet(next)
    const newValue = shouldMerge && isObject(value) ? (merge(value, next) as V) : (next as V)
    if (!equality || !equality(newValue, value) || sync) {
      value = newValue
      if (sync) e.emit('state', value)
    }
    lastSyncTime = performance.now()
  }

  for (const dep of dependencies) {
    dep(() => set(initial(handleDependency)))
  }

  const on = (sub: Subscription<V>) => e.on('state', sub)

  const onDispose = (fn: () => void): Unsubscribe => e.on('dispose', fn)

  return {
    set,
    on,
    mutate,
    get: () => value,
    onDispose,
    dispose: () => {
      e.emit('dispose', true)
      e.dispose()
      subs.dispose()
      dependencies.clear()
    },
    id,
    use: subs.add
  }
}

export type SignalOptions<R> = {
  track?: boolean
  equality?: Equals<R>
  merge?: Merge
  throttle?: number
}

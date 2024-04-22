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
  { equality = shallowEquals, merge = simpleMerge }: SignalOptions = {}
): Signal<R> => {
  const id = context.register()
  const s = createSignal<R>(id, fn, merge, equality)
  return s
}

/**
 * Creates a simple {@link Signal} for tracking a store.value
 */
const createSignal = <V>(
  id: string,
  initial: (use: UseSignalDependency) => V,
  merge: Merge,
  equality?: Equals
): Signal<V> => {
  const dependencies = new Set<Signal<any>['on']>()
  const subs = createSubscriptions()
  const e = createEvents<{ state: V; dispose: true }>()
  let loaded = false

  const handleDependency: UseSignalDependency = (s) => {
    if (!loaded) dependencies.add(s.on)
    return s.get()
  }

  let value = initial(handleDependency)

  loaded = true

  const mutate = (u: (value: V) => void, sync: boolean = true) => {
    u(value)
    if (sync) e.emit('state', value)
  }

  const set = (v: V | Partial<V> | ((v: V) => V | Partial<V>), sync: boolean = true): void => {
    const next = isFunction(v) ? (v as (v: V) => V)(value) : v
    if (!equality || !equality(next, value) || sync) {
      const shouldMerge = isObject(next) && !isArray(next) && !isMap(next) && !isSet(next)
      value = shouldMerge ? merge(value, next) : (next as V)
      if (sync) e.emit('state', value)
    }
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

export type SignalOptions = {
  track?: boolean
  equality?: Equals
  merge?: Merge
}

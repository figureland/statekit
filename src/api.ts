import type { Events, Subscription, Unsubscribe } from '.'

export type SubscribableHistoryEntry<V extends any> = [number, V]

export type Usable = {
  use: <S extends Disposable | (() => void)>(s: S) => S
}

export type Disposable = {
  dispose: () => void
}

export type Subscribable<V extends any = any> = Usable &
  Disposable & {
    id: string
    on: (sub: Subscription<V>) => Unsubscribe
    get: () => V
    events: Events<SubscribableEvents<V>>
  }

export type SubscribableEvents<V> = {
  state: V
  dispose: true
  previous: SubscribableHistoryEntry<V>
}

export type ReadonlySignal<V> = Subscribable<V>

export type Settable<V extends any = any> = Subscribable<V> & {
  set: (partial: V | Partial<V> | ((state: V) => V | Partial<V>), sync?: boolean) => void
}

export type SettableType<S> = S extends Settable<infer T> ? T : never

export type SubscribableType<S> = S extends Subscribable<infer T> ? T : never

export type UseSignalDependency = <S extends Subscribable>(u: S) => SubscribableType<S>

export type Signal<V> = Settable<V> & {
  mutate: (u: (val: V) => void, sync?: boolean) => void
}

export interface SignalObject<R extends Record<string, any>, K extends keyof R = keyof R>
  extends Settable<R> {
  key: <K extends keyof R>(key: K) => Signal<R[K]>
  keys: K[]
}

export type SignalMachineTransitions<
  States extends string,
  Events extends string,
  D extends object
> = {
  [State in States]: {
    on?: {
      [Event in Events]?: States
    }
    enter?: (data: Signal<D>, event: Events, from: States) => void
    exit?: (data: Signal<D>, event: Events, to: States) => void
  }
}

export type SignalMachine<
  States extends string,
  Events extends string,
  D extends object
> = Settable<States> & {
  is: (...states: States[]) => boolean
  send: (event: Events, d?: Partial<D>) => void
  data: Signal<D>
}

export interface SignalState<R extends Record<string, any>, K extends keyof R = keyof R>
  extends SignalObject<R, K> {
  reset: () => void
}

export type AnimatedSignal<V extends any> = Signal<V> & {
  tick: (delta: number) => void
}

export type System = Disposable &
  Usable & {
    unique: <S extends Subscribable>(key: string, s: () => S) => S
  }

export type SubscribableHistory<V> = Signal<V> & {
  restore: (n?: number) => void
}

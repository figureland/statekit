import {
  createEvents,
  manager,
  signal,
  type AnimatedSignal,
  type Events,
  type Signal,
  type Unsubscribe
} from '@figureland/statekit'
import { isBrowser } from './utils'
import { clamp, mapRange } from '@figureland/mathkit/number'

type EngineEvents = {
  start: void
  stop: void
  tick: number
  dispose: void
}

export const animation = ({ fps = 60 }: { fps?: number; epsilon?: number } = {}): Animated => {
  const m = manager()
  const active = m.use(signal(() => false))
  const events = m.use(createEvents<EngineEvents>())
  const animations: Set<AnimatedSignal<any>> = new Set()

  const timestep: number = 1000 / fps
  let lastTimestamp: number = 0
  let delta: number = 0

  const start = () => {
    active.set(true)
    events.emit('start', undefined)
  }

  const stop = () => {
    active.set(false)
    events.emit('stop', undefined)
  }

  const tick = (timestamp: number) => {
    const a = active.get()
    if (animations.size === 0 || !a) {
      if (a) active.set(false)
      return
    }
    if (timestamp - lastTimestamp < timestep) {
      return
    }
    delta = timestamp - lastTimestamp
    lastTimestamp = timestamp
    for (const a of animations) {
      a.update(delta)
    }
    events.emit('tick', delta)
  }

  const dispose = () => {
    active.set(false)
    m.dispose()
    animations.clear()
    events.emit('dispose', undefined)
  }

  return {
    active,
    start,
    stop,
    dispose,
    tick,
    onDispose: (fn) => events.on('dispose', fn),
    on: events.on,
    animated: <V>(s: Signal<V>, options: AnimatedSignalOptions<V>): AnimatedSignal<V> => {
      const a = m.use(createAnimated(s, options))
      animations.add(a)
      a.onDispose(() => animations.delete(a))
      if (!active.get()) start()
      return a
    }
  }
}

export type Animated = {
  active: Signal<boolean>
  tick: (timestamp: number) => void
  start: () => void
  stop: () => void
  dispose: () => void
  on: Events<EngineEvents>['on']
  onDispose: (fn: () => void) => Unsubscribe
  animated: <V>(s: Signal<V>, options: AnimatedSignalOptions<V>) => AnimatedSignal<V>
}

const createAnimated = <V extends any>(
  raw: Signal<V>,
  { duration = 500, easing = (v) => v, interpolate, epsilon = 16 }: AnimatedSignalOptions<V>
): AnimatedSignal<V> => {
  const m = manager()
  const clone = m.use(signal(raw.get))
  m.use(
    raw.onDispose(() => {
      m.dispose()
    })
  )

  const state = {
    target: raw.get(),
    active: false,
    progress: 0.0
  }

  const update = (delta: number) => {
    state.progress = clamp(state.progress + delta, 0, duration)
    const finished = state.progress === duration || duration - state.progress < epsilon

    if (!finished || state.active) {
      const amount = easing(mapRange(state.progress, 0, duration, 0, 1))
      clone.set((d) => interpolate(d, state.target, amount))
      state.active = !finished
    }
  }

  raw.on((v) => {
    state.progress = 0
    state.target = v
    state.active = true
    update(0)
  })

  return {
    ...clone,
    set: raw.set,
    raw,
    update,
    dispose: m.dispose
  }
}

type InterpolationFn<V> = (from: V, to: V, amount: number) => V

type AnimatedSignalOptions<V> = {
  duration?: number
  interpolate: InterpolationFn<V>
  easing?: (p: number) => number
  epsilon?: number
}

export const loop = (e: Animated, { autoStart = true }: { autoStart?: boolean } = {}) => {
  let raf: number
  const browser = isBrowser()
  const loop = (timestamp: number) => {
    e.tick(timestamp)
    if (browser) raf = requestAnimationFrame(loop)
  }
  e.on('start', () => {
    if (browser) raf = requestAnimationFrame(loop)
  })
  e.on('stop', () => {
    if (browser) cancelAnimationFrame(raf)
  })
  e.on('dispose', () => {
    if (browser) cancelAnimationFrame(raf)
  })
  if (autoStart) e.start()
  return e
}

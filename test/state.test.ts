import { describe, it, expect, mock } from 'bun:test'
import { State } from '../src'

describe('State', () => {
  it('initializes with the given initial state', () => {
    const initialState = { count: 0 }
    const state = new State({ initial: () => initialState })

    expect(state.get()).toEqual(initialState)
    expect(state.id).toEqual(expect.any(String))
  })

  it('sets and gets state updates', () => {
    const initialState = { count: 0 }
    const state = new State({ initial: () => initialState })

    state.set({ count: 10 })
    expect(state.get()).toEqual({ count: 10 })
  })

  it('subscribes to state changes', () => {
    const initialState = { count: 0 }
    const state = new State({ initial: () => initialState })
    const subscriber = mock(() => {})

    state.on(subscriber)
    state.set({ count: 10 })
    expect(subscriber).toHaveBeenCalledWith({ count: 10 })
  })

  it('disposes of subscriptions and signals', () => {
    const initialState = { count: 0 }
    const state = new State({ initial: () => initialState })
    state.dispose = mock(state.dispose)
    state.signal.dispose = mock(state.signal.dispose)

    state.dispose()
    expect(state.signal.dispose).toHaveBeenCalled()
  })

  it('resets to initial state', () => {
    const initialState = { count: 0 }
    const state = new State({ initial: () => initialState })

    state.set({ count: 10 })
    expect(state.get()).toEqual({ count: 10 })

    state.reset()
    expect(state.get()).toEqual(initialState)
  })
})

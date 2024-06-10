import { describe, it, expect, mock } from 'bun:test'
import { createEvents, effect, signal } from '../src'
import { isNumber } from '@figureland/typekit/guards'

describe('effect', () => {
  it('creates an effect which listens to other streams of events', () => {
    const exampleEvents = createEvents<{ something: number; else: string[] }>()
    const exampleSignal = signal(() => 10)

    const mockSub = mock(() => ({}))

    effect([exampleEvents, exampleSignal], mockSub)
    exampleEvents.emit('something', 10)
    exampleSignal.set(20)

    expect(mockSub).toHaveBeenCalledTimes(2)
  })
  it('receives values from events', () => {
    const exampleEvents = createEvents<{ something: number; else: string[] }>()
    const exampleSignal = signal(() => 10)

    let num: number = 0
    let other: string[] = []

    const mockSub = mock(() => ({}))
    effect([exampleEvents, exampleSignal], ([e]) => {
      mockSub()
      if (e) {
        const value = e[1]
        if (isNumber(value)) {
          num = value
        } else {
          other = value
        }
      }
    })

    exampleEvents.emit('something', 10)
    exampleEvents.emit('else', ['test'])

    expect(num).toBe(10)
    expect(other).toEqual(['test'])
    expect(mockSub).toHaveBeenCalledTimes(2)

    exampleSignal.set(20)
    expect(mockSub).toHaveBeenCalledTimes(3)
  })
  it('disposes properly', () => {
    const exampleEvents = createEvents<{ something: number; else: string[] }>()
    const exampleSignal = signal(() => 10)

    const mockSub = mock(() => ({}))
    const mockDispose = mock(() => ({}))

    const e = effect([exampleEvents, exampleSignal], mockSub)
    e.use(mockDispose)
    exampleEvents.emit('something', 10)
    exampleSignal.set(20)
    expect(mockSub).toHaveBeenCalledTimes(2)
    e.dispose()

    exampleSignal.set(20)
    expect(mockSub).toHaveBeenCalledTimes(2)
    expect(mockDispose).toHaveBeenCalledTimes(1)
  })
  it('triggers as expected', () => {
    const exampleEvents = createEvents<{ something: number; else: string[] }>()
    const exampleSignal = signal(() => 10)

    const mockSub = mock(() => ({}))

    effect([exampleEvents, exampleSignal], mockSub, { trigger: true })

    expect(mockSub).toHaveBeenCalledTimes(1)
  })
  it('debounces as expected', async () => {
    const exampleEvents = createEvents<{ something: number; else: string[] }>()
    const exampleSignal = signal(() => 10)

    const mockSub = mock(() => ({}))

    effect([exampleEvents, exampleSignal], mockSub, { throttle: 100 })

    exampleEvents.emit('something', 10)
    exampleSignal.set(20)
    expect(mockSub).toHaveBeenCalledTimes(1)

    await delay(50)

    exampleEvents.emit('something', 10)
    exampleSignal.set(20)
    exampleEvents.emit('something', 10)
    exampleSignal.set(20)

    await delay(200)

    expect(mockSub).toHaveBeenCalledTimes(2)

    exampleEvents.emit('something', 10)
    exampleSignal.set(20)

    await delay(200)

    expect(mockSub).toHaveBeenCalledTimes(3)
  })
})
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

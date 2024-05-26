import { describe, it, expect } from 'bun:test'
import { createEvents } from '../src'

describe('createEvents', () => {
  type EventMap = {
    event1: number
    event2: string
  }

  it('should subscribe to and emit a specific event', () => {
    const events = createEvents<EventMap>()
    let receivedValue = 0

    events.on('event1', (value) => {
      receivedValue = value
    })

    events.emit('event1', 42)
    expect(receivedValue).toBe(42)
  })

  it('should subscribe to and emit wildcard event', () => {
    const events = createEvents<EventMap>()
    let receivedEvent = ''
    let receivedValue: any = null

    events.on('*', ([key, value]) => {
      receivedEvent = key
      receivedValue = value
    })

    events.emit('event2', 'hello')
    expect(receivedEvent).toBe('event2')
    expect(receivedValue).toBe('hello')
  })

  it('should subscribe to multiple events using object', () => {
    const events = createEvents<EventMap>()
    let receivedValue1 = 0
    let receivedValue2 = ''

    events.on({
      event1: (value) => {
        receivedValue1 = value
      },
      event2: (value) => {
        receivedValue2 = value
      }
    })

    events.emit('event1', 42)
    events.emit('event2', 'world')

    expect(receivedValue1).toBe(42)
    expect(receivedValue2).toBe('world')
  })

  it('should remove specific event listener', () => {
    const events = createEvents<EventMap>()
    let receivedValue = 0

    const unsubscribe = events.on('event1', (value) => {
      receivedValue = value
    })

    unsubscribe()
    events.emit('event1', 42)

    expect(receivedValue).toBe(0)
  })

  it('should remove wildcard event listener', () => {
    const events = createEvents<EventMap>()
    let receivedValue: any = null

    const unsubscribe = events.on('*', ([, value]) => {
      receivedValue = value
    })

    unsubscribe()
    events.emit('event1', 42)

    expect(receivedValue).toBe(null)
  })

  it('should remove all event listeners on dispose', () => {
    const events = createEvents<EventMap>()
    let receivedValue1 = 0
    let receivedValue2 = ''

    events.on('event1', (value) => {
      receivedValue1 = value
    })

    events.on('event2', (value) => {
      receivedValue2 = value
    })

    events.dispose()

    events.emit('event1', 42)
    events.emit('event2', 'world')

    expect(receivedValue1).toBe(0)
    expect(receivedValue2).toBe('')
  })

  it('should correctly report the number of listeners', () => {
    const events = createEvents<EventMap>()
    expect(events.size()).toBe(0)

    const unsub1 = events.on('event1', () => {})
    expect(events.size()).toBe(1)

    const unsub2 = events.on('event2', () => {})
    expect(events.size()).toBe(2)

    unsub1()
    expect(events.size()).toBe(1)

    unsub2()
    expect(events.size()).toBe(0)
  })

  it('should not affect the last update after throttle period', async () => {
    const events = createEvents<EventMap>()
    const throttleDuration = 100
    let latestValue = 0

    events.on('event1', (value) => {
      latestValue = value
    })

    events.emit('event1', 200)
    await delay(throttleDuration + 10)
    events.emit('event1', 300)

    expect(latestValue).toBe(300)
  })
})

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

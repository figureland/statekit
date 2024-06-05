import { describe, it, expect } from 'bun:test'
import { createEvents } from '../src'
import { iterate } from '../src/utils/events'

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
    let count = 0
    events.all(([key, value]) => {
      receivedEvent = key
      receivedValue = value
      count++
    })

    events.emit('event1', 0)
    events.emit('event2', 'hello')
    expect(receivedEvent).toBe('event2')
    expect(receivedValue).toBe('hello')
    expect(count).toBe(2)
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

    const unsubscribe = events.all(([, value]) => {
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

  it('should allow number and symbol event names', () => {
    const events = createEvents<{ [key: symbol]: number; [key: number]: string }>()
    let receivedValue: any = null
    let count = 0

    const instance = Symbol.for('instance')
    events.on(instance, (value) => {
      receivedValue = value
      count++
    })

    events.emit(instance, 10)
    expect(receivedValue).toBe(10)
    expect(count).toBe(1)

    const exampleSymbol = Symbol()
    events.on(exampleSymbol, (value) => {
      receivedValue = value
      count++
    })

    events.emit(exampleSymbol, 20)
    expect(receivedValue).toBe(20)
    expect(count).toBe(2)

    let receivedStringValue = ''

    events.on(1, (value) => {
      receivedStringValue = value
      count++
    })

    events.emit(1, 'hello')
    expect(receivedStringValue).toBe('hello')
    expect(count).toBe(3)
  })
})

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// describe('iterate', () => {
//   type EventMap = {
//     event1: number
//     event2: string
//   }

//   it('should turn event subscription into an async iterator', async () => {
//     const events = createEvents<EventMap>()
//     const receivedValues: number[] = []

//     for await (const value of iterate(events, 'event1')) {
//       console.log(value)
//       receivedValues.push(value)
//       if (receivedValues.length === 3) break
//     }

//     expect(receivedValues).toEqual([1, 2, 3])
//   })

// it('should handle unsubscribing correctly', async () => {
//   const events = createEvents<EventMap>()
//   const receivedValues: number[] = []

//   const iterator = iterate(events, 'event1')
//   const subscription = (async () => {
//     for await (const value of iterator) {
//       receivedValues.push(value)
//       if (receivedValues.length === 2) break
//     }
//   })()

//   events.emit('event1', 1)
//   events.emit('event1', 2)
//   await subscription
//   events.emit('event1', 3)

//   expect(receivedValues).toEqual([1, 2])
// })

// it('should handle multiple events correctly', async () => {
//   const events = createEvents<EventMap>()
//   const receivedValues: (number | string)[] = []

//   setTimeout(() => {
//     events.emit('event1', 1)
//     events.emit('event2', 'hello')
//     events.emit('event1', 2)
//     events.emit('event2', 'world')
//   }, 10)

//   const iterator1 = iterate(events, 'event1')
//   const iterator2 = iterate(events, 'event2')

//   const subscription1 = (async () => {
//     for await (const value of iterator1) {
//       receivedValues.push(value)
//       if (receivedValues.length === 3) break
//     }
//   })()

//   const subscription2 = (async () => {
//     for await (const value of iterator2) {
//       receivedValues.push(value)
//       if (receivedValues.length === 4) break
//     }
//   })()

//   await Promise.all([subscription1, subscription2])

//   expect(receivedValues).toEqual([1, 'hello', 2, 'world'])
// })
// })

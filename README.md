![statekit illustration](./docs/statekit-hero.svg)

**statekit** is a simple toolkit of primitives for building apps and systems driven by data and events.

### `signal`

This is the base reactive primitive.

```typescript
import { signal } from '@figureland/statekit'

const v = signal(() => 0)

v.set(0) // set value to 0

v.set('m') // ts error

v.on((newValue: number) => {
  // ...
})

v.get() // returns 0
```

The signal provides a `use()` method you want to attach other dependencies to the signal. This is useful for attaching derived or related signals or event listeners

```typescript
const pointer = signal(() => ({ x: 0, y: 0 }))

const onMove = (e: PointerEvent) => {
  pointer.set({
    x: e.clientX,
    y: clientY
  })
}

const listener = window.addEventListener('pointermove', onMove)

pointer.use(() => window.removeEventListener('pointermove', onMove))

// When pointer is disposed, it will clean up the event listener as well
pointer.dispose()
```

#### Deriving Signals

If you want to create new signals derived from other signals or other sources that implement the `Subscribable` interface. You can use the first argument in the initialiser function. You can wrap this around any other signals, states or reactive objects from this library. It will pick up the dependencies and update automatically whenever they change.

```typescript
import { signal } from '@figureland/statekit'

const x = signal(() => 2)
const y = signal(() => 1)
const pos = signal((get) => ({
  x: get(x),
  y: get(x)
}))

post.on((newValue: { x: number; y: number }) => {
  // ...subscribes to the derived new value,
  // updates whenever x or y are updated
})
```

#### Equality

This library encourages you to decide yourself how a signal value has changed. You can do this using a custom equality check function. By default, signal does a basic shallow equality check to see if the value has changed.

```typescript
import { signal } from '@figureland/statekit'

const num = signal(() => 0, {
  equality: (a, b) => a === b
})
```

#### Merging

If you have an object complex nested state, you can provide your own custom merging function. By default, if the value is an object, it will use a simple `(a, b) => ({ ...a, ...b })` merge. More complex object-like variables such as `Map`, `Set`, or Arrays won't be merged unless you want them to. Something like [`deepmerge-ts`](https://github.com/RebeccaStevens/deepmerge-ts) could be a good way to do that.

```typescript
import { signal } from '@figureland/statekit'
import customMerge from './custom-merge'

const obj = signal(() => ({ x: 0, y: [{ a: 1, b: '2', c: { x: 1 } }] }), {
  merge: customMerge
})
```

### `signalObject`

This is a helper function that creates a record of multiple signals. You can subscribe to them as a collection or individually.

```typescript
import { signalObject } from '@figureland/statekit'

const v = signal({
  arr: [1],
  point: {
    x: 0,
    y: 0
  },
  value: 'something'
})

// Update the whole object

v.set({ value: 'another' })
v.set({ arr: [2] })
v.set((a) => ({ arr: [...a.arr, 3] }))

// Subscribe to whole object
v.on((newValue: { arr: number[]; point: { x: number; y: number; value: string } }) => {
  // ...
})

// Use individual properties

v.key('arr').get() // [1]
v.key('point').get() // { x: 0, y: 0 }

// Set individual properties
v.key('point').set({ x: 1, y: 2 })
```

### `persist`

The persist will wrap a signal and persist its value to a storage API (synchronously). The storage API is supplied as the second argument. This package provides a `typedLocalStorage` method that uses [superjson](https://github.com/blitz-js/superjson) to safely storage objects with a wider range of supported types than `JSON.stringify()`. If we want to persist in a type-safe way, we need to supply some extra information.

- `name` provides the path for the storage key. So, for example `['my','example','1']` would produce the key `my-example-1`.
- `validate` checks that the value in storage is of the same type as the signal.
- `fallback` is a value to immediately store if nothing valid is found.
- `interval` is a way of improving throttling the storage of values, for example if that don't need to be immediately persisted

```typescript
import { type PersistenceName, typedLocalStorage } from '@figureland/statekit/typed-local-storage'
import { isNumber } from '@figureland/typekit/guards'

const exampleSignal = signal(() => 0)

persist(
  exampleSignal,
  typedLocalStorage({
    name: ['example', 'signal'],
    validate: isNumber,
    fallback: exampleSignal.get,
    interval: 1000
  })
)
```

### `manager`

Often you need to manage multiple signals in one place, disposing of them all together when cleaning up.

```typescript
import { manager, signal } from '@figureland/statekit'

const create = () => {
  const { use, dispose } = manager()
  const one = use(signal(() => 0))
  const two = use(signal(() => [2]))
  const three = use(signal((get) => ({ v: get(one) })))

  return {
    one,
    two,
    three,
    dispose
  }
}
```

The manager also provides a `unique` method. This is a basic utility that you can use to generate idempotent signals based on a key. So rather than creating multiple signals that compute the same value, you allow multiple subscriptions to the same source.

```typescript
import { manager, signal } from '@figureland/statekit'

const create = () => {
  const { unique, dispose } = manager()
  const subscribe = (id: string) => unique(id, () => signal(() => getSomething(id)))

  return {
    dispose,
    subscribe
  }
}
```

## Scripts

### Install

```bash
bun install
```

### Test

```bash
bun test
```

### Build

```bash
bun run build
```

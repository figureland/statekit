![statekit illustration](./docs/statekit-hero.svg)

**statekit** is a simple, powerful toolkit of primitives for building apps and systems driven by data, events and messages.

### `Signal<V>(() => V)`

```typescript
signal<R>(fn: (use: UseSignalDependency) => R, options?: SignalOptions): Signal<R>
```

**Parameters:**

- **`fn`** `(use: UseSignalDependency) => R`: Function to compute the signal's value, with dependency management.
- **`options`** `SignalOptions` (optional): Configuration for equality checks and merging strategies.
  - **`equality`** `Equals`: Determines if updates are necessary based on value changes.
  - **`merge`** `Merge`: Merges updates into the current state, used for object states.

```ts
import { signal } from '@figureland/statekit'

const v = signal(() => 0)

v.set(0) // set value to 0

v.set('m') // ts error

v.on((newValue: number) => {
  // ...
})

v.get() // returns 0
```

#### Deriving Signals

If you want to create new signals derived from other signals, you can use the first argument in the initialiser function. You can wrap this around any other signals, states or reactive objects from this library. It will pick up the dependencies and update automatically whenever they change.

```ts
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

```ts
import { signal } from '@figureland/statekit'

const num = signal(() => 0, {
  equality: (a, b) => a === b
})
```

#### Merging

If you have an object complex nested state, you can provide your own custom merging function. By default, if the value is an object, it will use a simple `(a, b) => ({ ...a, ...b })` merge. More complex object-like variables such as `Map`, `Set`, or Arrays won't be merged unless you want them to. Something like [`deepmerge-ts`](https://github.com/RebeccaStevens/deepmerge-ts) could be a good way to do that.

```ts
import { signal } from '@figureland/statekit'
import customMerge from './custom-merge'

const obj = signal(() => ({ x: 0, y: [{ a: 1, b: '2', c: { x: 1 } }] }), {
  merge: customMerge
})
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

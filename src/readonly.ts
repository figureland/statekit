import { type ReadonlySubscribable, type Subscribable } from '.'

export const readonly = <S extends Subscribable>(s: S): ReadonlySubscribable<S> => ({
  id: s.id,
  get: s.get,
  on: s.on,
  use: s.use
})

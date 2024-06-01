import type { SettableGettable, SettableType } from '@figureland/statekit'
import { isArray } from '@figureland/typekit/guards'

export type StorageAPI<T> = {
  get: () => Promise<T>
  set: (data: T) => Promise<void>
}

export type StorageAPIOptions<T> = {
  name: PersistenceName
  validate: ((v: unknown) => Promise<boolean>) | ((v: unknown) => v is T)
  refine?: {
    get: ((v: unknown) => Promise<T>) | ((v: unknown) => T)
    set: ((v: T) => Promise<any>) | ((v: T) => any)
  }
  fallback: (() => T) | (() => Promise<T>)
}

export const getStorageName = (n: string | PersistenceName) => (isArray(n) ? n.join('/') : n)

export type PersistenceName = string[]

export const persist = <S extends SettableGettable<any>>(
  s: S,
  storage: StorageAPI<SettableType<S>>
) => {
  storage.get().then(s.set)
  s.on((v) => storage.set(v))
  return s
}

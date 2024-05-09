import type { Settable, SettableType } from '@figureland/statekit'
import { isArray } from '@figureland/typekit'

export type StorageAPI<T> = {
  get: () => Promise<T>
  set: (data: T) => Promise<void>
}

export type StorageAPIOptions<T> = {
  name: PersistenceName
  validate: (v: unknown) => v is T
  fallback: () => T
  refine?: {
    get: (v: unknown) => Promise<T>
    set: (v: T) => Promise<string>
  }
}

export const getStorageName = (n: string | PersistenceName) => (isArray(n) ? n.join('/') : n)

export type PersistenceName = string[]

export const persist = <S extends Settable<any>>(s: S, storage: StorageAPI<SettableType<S>>) => {
  storage.get().then(s.set)
  s.on((v) => storage.set(v))
  return s
}

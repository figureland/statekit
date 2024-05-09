import { type Settable, type SettableType } from '@figureland/statekit'
import { isArray } from '@figureland/typekit/guards'

export type StorageAPI<T> = {
  get: (fallback: () => T) => Promise<T>
  set: (data: T) => Promise<void>
}

export type StorageAPIOptions<T> = {
  name: PersistenceName
  validate: Promise<(v: unknown) => boolean> | ((v: unknown) => v is T)
  refine?: {
    get: (v: unknown) => Promise<T> | ((v: unknown) => T)
    set: (v: T) => Promise<string> | ((v: T) => string)
  }
}

export const getStorageName = (n: string | PersistenceName) => (isArray(n) ? n.join('/') : n)

export type PersistenceName = string[]

export const persist = <S extends Settable<any>>(s: S, storage: StorageAPI<SettableType<S>>) => {
  storage.get(s.get).then(s.set).catch()
  s.on((v) => storage.set(v))
  return s
}

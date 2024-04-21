import type { Settable, SettableType } from '@figureland/statekit'
import { isArray } from '@figureland/typekit'

export type StorageAPI<T> = {
  get: () => T
  set: (data: T) => void
}

export type StorageAPIOptions<T> = {
  name: PersistenceName
  validate: (v: unknown) => boolean
  fallback: () => T
}

export const getStorageName = (n: string | PersistenceName) => (isArray(n) ? n.join('/') : n)

export type PersistenceName = string[]

export const persist = <S extends Settable<any>>(s: S, storage: StorageAPI<SettableType<S>>) => {
  const existing = storage.get()
  if (existing) s.set(existing)
  s.on(storage.set)
  return s
}

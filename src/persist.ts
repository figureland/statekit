import type { Settable, SettableType } from '.'
import { isArray } from '@figureland/typekit'

export type StorageAPI<T> = {
  get: (name: string) => T
  set: (name: string, data: T) => void
}

export type LocalStorageValidator = (v: unknown) => boolean

const getStorageName = (n: string | PersistenceName) => (isArray(n) ? n.join('/') : n)

export type PersistenceName = string[]

export type PersistenceOptions<S extends Settable> = {
  name: PersistenceName
  storage: StorageAPI<SettableType<S>>
  syncTabs?: boolean
  interval?: number
}

export const persist = <S extends Settable<any>>(s: S, options: PersistenceOptions<S>) => {
  let lastUpdate: number = performance.now()
  const existing = options.storage.get(getStorageName(options.name))
  if (existing) s.set(s, existing)

  s.on((state) => {
    const now = performance.now()
    if (!options.interval || now - lastUpdate >= options.interval) {
      options.storage.set(getStorageName(options.name), state)
      lastUpdate = now
    }
  })
  return s
}

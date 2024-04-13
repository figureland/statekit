import { type Settable } from '.'
import { isArray } from '@figureland/typekit'

export type StorageOptions = {
  name: PersistenceName
  storage: StorageAPI
  validate: LocalStorageValidator
}

export type StorageAPI = {
  get: (name: string) => unknown
  set: (name: string, data: unknown) => void
}

export type LocalStorageValidator = (v: unknown) => boolean

const getStorageName = (n: string | PersistenceName) => (isArray(n) ? n.join('/') : n)

export const storageGet = <T>(
  { storage, name, validate }: StorageOptions,
  fallback: () => T
): T => {
  const target = getStorageName(name)
  try {
    const result = storage.get(target)
    if (!validate(result)) {
      throw new Error('Failed to parse data')
    }
    return result as T
  } catch (e) {
    storage.set(target, fallback())
    return fallback()
  }
}

export const storageSet = <T>(
  { storage, name }: Pick<StorageOptions, 'storage' | 'name'>,
  value: T
): void => {
  storage.set(getStorageName(name), value)
}

export type PersistenceName = string[]

export type PersistenceOptions<S extends Settable> = StorageOptions & {
  syncTabs?: boolean
  interval?: number
  set?: (s: S, value: any) => void
}

export const persist = <S extends Settable<any>>(s: S, options: PersistenceOptions<S>) => {
  let lastUpdate: number = performance.now()
  const existing = storageGet(options, s.get)
  options.set ? options.set(s, existing) : s.set(existing)

  s.on((state) => {
    const now = performance.now()
    if (!options.interval || now - lastUpdate >= options.interval) {
      storageSet(options, state)
      lastUpdate = now
    }
  })
  return s
}

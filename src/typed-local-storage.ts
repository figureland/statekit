import { parse, stringify } from 'superjson'
import { getStorageName, type StorageAPI, type StorageAPIOptions } from './persist'

declare var localStorage: Storage

export const typedLocalStorage = <T>({
  name,
  validate,
  fallback,
  interval
}: StorageAPIOptions<T> & { interval?: number }): StorageAPI<T> => {
  let lastUpdate: number = performance.now()

  const target = getStorageName(name)
  const set = async (v: T) => {
    const now = performance.now()

    if (!interval || now - lastUpdate >= interval) {
      localStorage.setItem(target, stringify(v))
      lastUpdate = now
    }
  }
  const get = async () => {
    try {
      const result = parse(localStorage.getItem(target) || '')
      if (validate(result)) {
        return result as T
      }
      throw new Error(`Invalid value in ${target}`)
    } catch (e) {
      const v = fallback()
      await set(v)
      return v
    }
  }
  return {
    set,
    get
  }
}

import { parse, stringify } from 'superjson'
import { getStorageName, type StorageAPI, type StorageAPIOptions } from './persist'

declare var localStorage: Storage

export const typedLocalStorage = <T>({
  name,
  validate,
  fallback
}: StorageAPIOptions<T>): StorageAPI<T> => {
  const target = getStorageName(name)
  const set = (v: T) => localStorage.setItem(target, stringify(v))
  const get = () => {
    const result = parse(localStorage.getItem(target) || '')
    if (validate(result)) {
      return result as T
    } else {
      const v = fallback()
      set(v)
      return v
    }
  }
  return {
    set,
    get
  }
}

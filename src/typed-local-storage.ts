import { parse, stringify } from 'superjson'
import type { LocalStorageValidator, StorageAPI } from './persist'

declare var localStorage: Storage

export const typedLocalStorage = <T>(
  validate: LocalStorageValidator,
  fallback: () => T
): StorageAPI => {
  const set = (target: string, v: T) => localStorage.setItem(target, stringify(v))
  const get = (target: string) => {
    const result = parse(localStorage.getItem(target) || '')
    if (validate(result)) {
      return result
    } else {
      const v = fallback()
      set(target, v)
      return v
    }
  }
  return {
    set,
    get
  }
}

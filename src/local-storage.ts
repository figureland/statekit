import { parse, stringify } from 'superjson'
import type { StorageAPI } from './persist'

declare var localStorage: Storage

export const localStorageAPI: StorageAPI = {
  set: (target: string, v: any) => localStorage.setItem(target, stringify(v)),
  get: (target: string) => parse(localStorage.getItem(target) || '')
}

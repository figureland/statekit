import { type LocalStorageValidator, type Settable, setLocalStorage, getLocalStorage } from '.'

export type PersistenceName = string[]

export type PersistenceOptions<S extends any = any> = {
  name: PersistenceName
  validate: LocalStorageValidator
  syncTabs?: boolean
  interval?: number
  set?: (s: S, v: any) => void
}

export const persist = <S extends Settable<any>>(s: S, options: PersistenceOptions<S>) => {
  let lastUpdate: number = performance.now()
  const existing = getLocalStorage(options.name, options.validate, s.get)
  options.set ? options.set(s, existing) : s.set(existing)

  s.on((state) => {
    const now = performance.now()
    if (!options.interval || now - lastUpdate >= options.interval) {
      setLocalStorage(options.name, state)
      lastUpdate = now
    }
  })
  return s
}

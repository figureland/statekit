import {
  type SubscribableType,
  type Subscribable,
  type SubscribableHistoryEntry,
  type Signal,
  type SubscribableHistory,
  signal
} from '.'

export type HistoryOptions = {
  limit?: number
}

export const history = <S extends Subscribable | Signal<any>>(
  s: S,
  { limit = 50 }: HistoryOptions = {}
): SubscribableHistory<SubscribableHistoryEntry<SubscribableType<S>>[]> => {
  const state = signal<SubscribableHistoryEntry<SubscribableType<S>>[]>(() => [])

  s.onPrevious((e) => {
    state.mutate((s) => {
      s.push(e)
      if (s.length > limit) s.shift()
    })
  })

  const restore = () => {
    if ('set' in s) {
      const last = state.get()[state.get().length - 1]
      if (last) s.set(last[1])
    }
  }

  return {
    ...state,
    restore
  }
}

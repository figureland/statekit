import { signalObject } from './signal-object'
import { type SignalObject, type SignalState, type StorageAPI } from '.'
import { persist } from './persist'

export type StateOptions<S extends object = object> = {
  initial: () => S
  persistence?: StorageAPI<S>
}

/* Generic foundation class for managing reactive state */
export class State<S extends object, K extends string & keyof S = string & keyof S>
  implements SignalState<S, K>
{
  public signal: SignalObject<S>
  protected initial: () => S

  constructor({ initial, persistence }: StateOptions<S>) {
    this.initial = initial
    this.signal = signalObject(initial())
    if (persistence) {
      persist(this.signal, persistence)
    }
  }

  get set() {
    return this.signal.set
  }

  get id() {
    return this.signal.id
  }

  get get() {
    return this.signal.get
  }

  get key() {
    return this.signal.key
  }

  get keys() {
    return this.signal.keys as K[]
  }

  get events() {
    return this.signal.events
  }

  get on() {
    return this.signal.on
  }

  get dispose() {
    return this.signal.dispose
  }

  get use() {
    return this.signal.use
  }

  public reset = () => {
    this.signal.set(this.initial())
  }
}

/*  Check if a value is a State */
export const isState = (s: any): s is State<any> => s instanceof State

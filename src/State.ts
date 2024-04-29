import { signalObject } from './signal-object'
import { manager, type SignalObject, type SignalState, type StorageAPI } from '.'
import { persist } from './persist'

export type StateOptions<S extends object = object> = {
  initial: () => S
  persistence?: StorageAPI<S>
}

/* Generic foundation class for managing reactive state */
export class State<S extends object, K extends string & keyof S = string & keyof S>
  implements SignalState<S, K>
{
  private manager = manager()
  public readonly id: string
  public signal: SignalObject<S>
  protected initial: () => S

  constructor({ initial, persistence }: StateOptions<S>) {
    this.initial = initial
    this.signal = this.manager.use(signalObject(initial()))
    this.id = this.signal.id
    if (persistence) {
      persist(this.signal, persistence)
    }
  }

  public set: SignalState<S, K>['set'] = (u, sync) => {
    this.signal.set(u, sync)
  }

  /*  Get the current state */
  public get: SignalState<S, K>['get'] = () => this.signal.get()

  public key: SignalState<S, K>['key'] = (k) => this.signal.key(k)

  get keys() {
    return this.signal.keys as K[]
  }

  /* Subscribe to all state changes */
  public on: SignalState<S, K>['on'] = (sub) => this.signal.on(sub)

  public dispose = () => {
    this.signal.dispose()
    this.manager.dispose()
  }

  public onDispose: SignalState<S, K>['onDispose'] = (fn) => this.signal.onDispose(fn)

  public onPrevious: SignalState<S, K>['onPrevious'] = (fn) => this.signal.onPrevious(fn)

  /*
   *  Add a unsubscribe hook to be called when the state is disposed
   *  @param subs - unsubscribe hooks
   */
  public use: SignalState<S, K>['use'] = (s) => this.manager.use(s)

  /* Reset the state to its initial provided value, initial() */
  public reset = () => {
    this.set(this.initial())
  }
}

/*  Check if a value is a State */
export const isState = (s: any): s is State<any> => s instanceof State

export type StateType<S> = S extends State<infer T> ? T : never

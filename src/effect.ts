import { system, type Effect, type Events, type Signal } from '.'

type SourceValue<S> =
  S extends Signal<infer V>
    ? V
    : S extends Events<infer E, infer K>
      ? [K, E[keyof E]] | undefined
      : never

export const effect = <S extends (Signal<any> | Events<any>)[]>(
  sources: [...S],
  callback: (values: { [K in keyof S]: SourceValue<S[K]> }) => void,
  { trigger }: { trigger?: boolean } = {}
): Effect => {
  const { use, dispose } = system()

  const updateValues = (triggeredEvent?: [keyof any, any]) => {
    const values = sources.map((source, index) => {
      if ('get' in source) {
        return source.get()
      } else if (triggeredEvent && index === sources.indexOf(source)) {
        return triggeredEvent
      } else {
        return undefined
      }
    }) as { [K in keyof S]: SourceValue<S[K]> }
    callback(values)
  }

  sources.forEach((source) => {
    if ('get' in source) {
      use(
        source.on(() => {
          updateValues()
        })
      )
    } else if ('all' in source) {
      use(
        source.all((event) => {
          updateValues(event)
        })
      )
    }
  })

  if (trigger) {
    updateValues()
  }

  return {
    use,
    dispose
  }
}

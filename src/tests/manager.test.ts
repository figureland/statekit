import { describe, test, expect, beforeEach } from 'bun:test'
import { manager } from '../utils/manager'
import type { Disposable } from '../api'

type DisposableMock = Disposable & {
  disposed: () => boolean
}

const fn = (): DisposableMock => {
  const state = {
    disposed: false
  }

  return {
    disposed: () => state.disposed,
    dispose: () => {
      state.disposed = true
    }
  }
}

describe('Manager', () => {
  let resourceManager

  beforeEach(() => {
    resourceManager = manager()
  })

  test('should subscribe and dispose resources correctly', () => {
    const mockDisposable = fn()

    // Use the resource
    resourceManager.use(mockDisposable)
    expect(mockDisposable.disposed()).toBe(false)

    // Dispose all resources
    resourceManager.dispose()
    expect(mockDisposable.disposed()).toBe(true)
  })

  test('should handle multiple resources', () => {
    const disposables = [fn(), fn(), fn()]

    disposables.forEach((d) => resourceManager.use(d))
    disposables.forEach((d) => expect(d.disposed()).toBe(false))

    disposables[1].dispose()
    expect(disposables[1].disposed()).toBe(true)

    resourceManager.dispose()
    disposables.forEach((d) => expect(d.disposed()).toBe(true))
  })

  test('should handle multiple resources in a single use call', () => {
    const disposables = [fn(), fn(), fn()]

    resourceManager.use(...disposables)
    disposables.forEach((d) => expect(d.disposed()).toBe(false))

    disposables[1].dispose()
    expect(disposables[1].disposed()).toBe(true)

    resourceManager.dispose()
    disposables.forEach((d) => expect(d.disposed()).toBe(true))
  })

  test('should not fail if disposing already disposed resources', () => {
    const mockDisposable = fn()
    resourceManager.use(mockDisposable)
    resourceManager.dispose()
    expect(() => resourceManager.dispose()).not.toThrow()
    expect(mockDisposable.disposed()).toBe(true)
  })

  test('should ensure all disposables are cleared after disposal', () => {
    const mockDisposable = fn()

    resourceManager.use(mockDisposable)
    expect(mockDisposable.disposed()).toBe(false)

    resourceManager.dispose()
    expect(mockDisposable.disposed()).toBe(true)
  })
})

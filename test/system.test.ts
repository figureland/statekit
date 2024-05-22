import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { NiceMap } from '@figureland/typekit'
import { system, disposable, SystemManager } from '../src/system'
import type { Subscribable } from '../src/api'

describe('system', () => {
  it('should create a system with use, unique, and dispose methods', () => {
    const testSystem = system()
    expect(testSystem).toHaveProperty('use')
    expect(testSystem).toHaveProperty('unique')
    expect(testSystem).toHaveProperty('dispose')
  })

  it('should use and dispose a disposable', () => {
    const testSystem = system()
    const mockDispose = mock(() => ({}))
    const disp = disposable(mockDispose)
    testSystem.use(disp)
    testSystem.dispose()
    expect(mockDispose).toHaveBeenCalled()
  })

  it('should use and dispose a function', () => {
    const testSystem = system()
    const mockDispose = mock(() => ({}))
    testSystem.use(mockDispose)
    testSystem.dispose()
    expect(mockDispose).toHaveBeenCalled()
  })

  it('should create unique instances based on keys', () => {
    const testSystem = system()
    const st = {}
    const mockSubscribable = mock(() => st as Subscribable)
    const instance1 = testSystem.unique('key1', mockSubscribable)
    const instance2 = testSystem.unique('key1', mockSubscribable)
    expect(instance1).toBe(instance2)
    expect(mockSubscribable).toHaveBeenCalledTimes(1)
  })

  it('should clear all keyed subscriptions on dispose', () => {
    const testSystem = system()
    const mockDispose = mock(() => ({}))
    const mockSubscribable = () => disposable(mockDispose) as Subscribable
    testSystem.unique('key1', mockSubscribable)
    testSystem.dispose()
    const newInstance = testSystem.unique('key1', mockSubscribable)
    expect(newInstance).not.toBe(mockDispose.mock.results[0].value)
  })

  it('should clear all subscriptions on dispose', () => {
    const testSystem = system()
    const mockDispose1 = mock(() => ({}))
    const mockDispose2 = mock(() => ({}))
    testSystem.use(disposable(mockDispose1))
    testSystem.use(disposable(mockDispose2))
    testSystem.dispose()
    expect(mockDispose1).toHaveBeenCalled()
    expect(mockDispose2).toHaveBeenCalled()
  })
})

describe('SystemManager', () => {
  it('should have use, unique, and dispose methods', () => {
    const systemInstance = new SystemManager()
    expect(systemInstance).toHaveProperty('use')
    expect(systemInstance).toHaveProperty('unique')
    expect(systemInstance).toHaveProperty('dispose')
  })

  it('should use and dispose a disposable', () => {
    const systemInstance = new SystemManager()
    const mockDispose = mock(() => ({}))
    const disp = disposable(mockDispose)
    systemInstance.use(disp)
    systemInstance.dispose()
    expect(mockDispose).toHaveBeenCalled()
  })

  it('should use and dispose a function', () => {
    const systemInstance = new SystemManager()
    const mockDispose = mock(() => ({}))
    systemInstance.use(mockDispose)
    systemInstance.dispose()
    expect(mockDispose).toHaveBeenCalled()
  })

  it('should create unique instances based on keys', () => {
    const systemInstance = new SystemManager()
    const mockSubscribable = mock(() => ({}) as Subscribable)
    const instance1 = systemInstance.unique('key1', mockSubscribable)
    const instance2 = systemInstance.unique('key1', mockSubscribable)
    expect(instance1).toBe(instance2)
    expect(mockSubscribable).toHaveBeenCalledTimes(1)
  })

  it('should clear all keyed subscriptions on dispose', () => {
    const systemInstance = new SystemManager()
    const mockSubscribable = mock(() => ({}))
    systemInstance.unique('key1', () => disposable(mockSubscribable) as Subscribable)
    systemInstance.dispose()
    const newInstance = systemInstance.unique(
      'key1',
      () => disposable(mockSubscribable) as Subscribable
    )
    expect(newInstance).not.toBe(mockSubscribable.mock.results[0].value)
  })

  it('should clear all subscriptions on dispose', () => {
    const systemInstance = new SystemManager()

    const mockDispose1 = mock(() => ({}))
    const mockDispose2 = mock(() => ({}))
    systemInstance.use(disposable(mockDispose1))
    systemInstance.use(disposable(mockDispose2))
    systemInstance.dispose()
    expect(mockDispose1).toHaveBeenCalled()
    expect(mockDispose2).toHaveBeenCalled()
  })
})

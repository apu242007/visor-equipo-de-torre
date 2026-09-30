import { describe, expect, it, vi } from 'vitest'
import { createIdleTracker, type IdleTimers } from './idle'

function fakeTimers() {
  let pending: { fn: () => void; at: number; id: number } | null = null
  let now = 0
  let nextId = 1
  const timers: IdleTimers = {
    set: (fn, ms) => {
      pending = { fn, at: now + ms, id: nextId++ }
      return pending.id
    },
    clear: (handle) => {
      if (pending && pending.id === handle) pending = null
    },
  }
  return {
    timers,
    advance(ms: number) {
      now += ms
      if (pending && pending.at <= now) {
        const { fn } = pending
        pending = null
        fn()
      }
    },
    hasPending: () => pending !== null,
  }
}

describe('createIdleTracker', () => {
  it('pasa a reposo solo después del retardo sin actividad', () => {
    const t = fakeTimers()
    const onChange = vi.fn()
    const tracker = createIdleTracker(250, onChange, t.timers)
    tracker.activity()
    t.advance(249)
    expect(tracker.idle).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
    t.advance(1)
    expect(tracker.idle).toBe(true)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('la actividad sale del reposo y reinicia la cuenta', () => {
    const t = fakeTimers()
    const onChange = vi.fn()
    const tracker = createIdleTracker(250, onChange, t.timers)
    tracker.activity()
    t.advance(250)
    expect(tracker.idle).toBe(true)
    tracker.activity()
    expect(tracker.idle).toBe(false)
    expect(onChange).toHaveBeenLastCalledWith(false)
    t.advance(250)
    expect(tracker.idle).toBe(true)
  })

  it('actividad repetida no dispara el reposo hasta que cesa', () => {
    const t = fakeTimers()
    const onChange = vi.fn()
    const tracker = createIdleTracker(250, onChange, t.timers)
    for (let i = 0; i < 5; i++) {
      tracker.activity()
      t.advance(100)
    }
    expect(onChange).not.toHaveBeenCalled()
    t.advance(150)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('dispose cancela el temporizador pendiente', () => {
    const t = fakeTimers()
    const tracker = createIdleTracker(250, vi.fn(), t.timers)
    tracker.activity()
    expect(t.hasPending()).toBe(true)
    tracker.dispose()
    expect(t.hasPending()).toBe(false)
  })
})

// Reactive store — Vue 3 replacement for the useSyncExternalStore pattern
// in the original cmdk (https://github.com/dip/cmdk) by Paco Coursey.
//
// The original kept state in a plain mutable object and used a subscriber
// Set + useSyncExternalStore to push updates to React. In Vue, reactivity is
// built in: we make the State object reactive() and all computed() properties
// that read from it update automatically — no manual subscribe/emit needed.
//
// The Store interface is preserved so the rest of the logic (filterItems,
// sort, setState, etc.) is unchanged line-for-line.

import { reactive } from 'vue'
import type { State, Store } from './types'

export function createStore(initialValue: string = ''): { state: State; store: Store } {
  const state = reactive<State>({
    search: '',
    value: initialValue,
    selectedItemId: undefined,
    filtered: {
      count: 0,
      items: new Map(),
      groups: new Set(),
    },
  })

  // Subscribers kept for API parity; Vue reactivity handles re-renders
  // but some internal logic (e.g. scheduling) still calls emit().
  const listeners = new Set<() => void>()

  const store: Store = {
    subscribe: (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    snapshot: () => state,
    setState: (key, value, opts) => {
      if (Object.is((state as any)[key], value)) return
      ;(state as any)[key] = value
      store.emit()
      return opts // suppress unused-var lint
    },
    emit: () => {
      listeners.forEach((l) => l())
    },
  }

  return { state, store }
}

// Provide/inject symbol keys — Vue 3 replacement for React.createContext.
// One symbol per context object, matching the three contexts in the original.

import type { InjectionKey } from 'vue'
import type { Context, Store, Group } from './types'

export const CommandContextKey: InjectionKey<Context> = Symbol('CommandContext')
export const StoreContextKey: InjectionKey<Store> = Symbol('StoreContext')
export const GroupContextKey: InjectionKey<Group> = Symbol('GroupContext')

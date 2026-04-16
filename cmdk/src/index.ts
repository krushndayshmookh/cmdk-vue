// cmdk-vue — Vue 3 port of cmdk (https://github.com/dip/cmdk)
// Original authors: Paco Coursey and contributors.
// Vue 3 port: Krushn Dayshmookh, with Claude (Anthropic AI), 2026.

import { computed, inject } from 'vue'
import { StoreContextKey } from './keys'
import type { State } from './types'

// ---------------------------------------------------------------------------
// Components — exported to mirror original named exports exactly
// ---------------------------------------------------------------------------

export { default as CommandRoot } from './components/Command.vue'
export { default as CommandInput } from './components/CommandInput.vue'
export { default as CommandList } from './components/CommandList.vue'
export { default as CommandItem } from './components/CommandItem.vue'
export { default as CommandGroup } from './components/CommandGroup.vue'
export { default as CommandSeparator } from './components/CommandSeparator.vue'
export { default as CommandDialog } from './components/CommandDialog.vue'
export { default as CommandEmpty } from './components/CommandEmpty.vue'
export { default as CommandLoading } from './components/CommandLoading.vue'

// ---------------------------------------------------------------------------
// Compound object — mirrors `Command.Input`, `Command.List`, etc. usage
// ---------------------------------------------------------------------------

import CommandRootComponent from './components/Command.vue'
import CommandInputComponent from './components/CommandInput.vue'
import CommandListComponent from './components/CommandList.vue'
import CommandItemComponent from './components/CommandItem.vue'
import CommandGroupComponent from './components/CommandGroup.vue'
import CommandSeparatorComponent from './components/CommandSeparator.vue'
import CommandDialogComponent from './components/CommandDialog.vue'
import CommandEmptyComponent from './components/CommandEmpty.vue'
import CommandLoadingComponent from './components/CommandLoading.vue'

export const Command = Object.assign(CommandRootComponent, {
  Input: CommandInputComponent,
  List: CommandListComponent,
  Item: CommandItemComponent,
  Group: CommandGroupComponent,
  Separator: CommandSeparatorComponent,
  Dialog: CommandDialogComponent,
  Empty: CommandEmptyComponent,
  Loading: CommandLoadingComponent,
})

// ---------------------------------------------------------------------------
// useCommandState — replaces the React useCmdk hook
// Returns a computed ref of the selected state slice.
// ---------------------------------------------------------------------------

export function useCommandState<T>(selector: (state: State) => T) {
  const store = inject(StoreContextKey)
  if (!store) throw new Error('useCommandState must be used inside a <Command> component')
  return computed(() => selector(store.snapshot()))
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export { commandScore as defaultFilter } from './command-score'
export type {
  CommandProps,
  ItemProps,
  GroupProps,
  InputProps,
  ListProps,
  DialogProps,
  SeparatorProps,
  LoadingProps,
  EmptyProps,
  State,
  CommandFilter,
} from './types'

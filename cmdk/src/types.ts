// Type definitions ported from the original cmdk (https://github.com/dip/cmdk)
// by Paco Coursey. React-specific types replaced with Vue/HTML equivalents;
// all prop shapes and semantics are preserved exactly.

import type { Ref } from 'vue'

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export type CommandFilter = (value: string, search: string, keywords?: string[]) => number

// ---------------------------------------------------------------------------
// State & Store (unchanged from original)
// ---------------------------------------------------------------------------

export type State = {
  search: string
  value: string
  selectedItemId?: string
  filtered: { count: number; items: Map<string, number>; groups: Set<string> }
}

export type Store = {
  subscribe: (callback: () => void) => () => void
  snapshot: () => State
  setState: <K extends keyof State>(key: K, value: State[K], opts?: any) => void
  emit: () => void
}

// ---------------------------------------------------------------------------
// Internal context shapes (unchanged from original; Ref replaces React.RefObject)
// ---------------------------------------------------------------------------

export type Context = {
  value: (id: string, value: string, keywords?: string[]) => void
  item: (id: string, groupId: string) => () => void
  group: (id: string) => () => void
  filter: () => boolean
  label: string
  getDisablePointerSelection: () => boolean
  // Ids
  listId: string
  labelId: string
  inputId: string
  // Refs
  listInnerRef: Ref<HTMLDivElement | null>
}

export type Group = {
  id: string
  forceMount?: boolean
}

// ---------------------------------------------------------------------------
// Component props
// (React.ComponentPropsWithoutRef<'div'> → HTMLAttributes is implicit via
//  Vue's inheritAttrs; explicit extra props below match the original exactly)
// ---------------------------------------------------------------------------

export type LoadingProps = {
  /** Estimated progress of loading asynchronous options. */
  progress?: number
  /** Accessible label for this loading progressbar. Not shown visibly. */
  label?: string
}

export type EmptyProps = Record<string, never>

export type SeparatorProps = {
  /** Whether this separator should always be rendered. Useful if you disable automatic filtering. */
  alwaysRender?: boolean
}

export type DialogProps = CommandProps & {
  /** Whether the dialog is open. */
  open?: boolean
  /** Provide a className to the Dialog overlay. */
  overlayClassName?: string
  /** Provide a className to the Dialog content. */
  contentClassName?: string
  /** Provide a custom element the Dialog should portal into. */
  container?: HTMLElement
}

export type ListProps = {
  /** Accessible label for this List of suggestions. Not shown visibly. */
  label?: string
}

export type ItemProps = {
  /** Whether this item is currently disabled. */
  disabled?: boolean
  /**
   * A unique value for this item.
   * If no value is provided, it will be inferred from `children` or the rendered `textContent`.
   */
  value?: string
  /** Optional keywords to match against when filtering. */
  keywords?: string[]
  /** Whether this item is forcibly rendered regardless of filtering. */
  forceMount?: boolean
}

export type GroupProps = {
  /** Optional heading to render for this group. */
  heading?: string
  /** If no heading is provided, you must provide a value that is unique for this group. */
  value?: string
  /** Whether this group is forcibly rendered regardless of filtering. */
  forceMount?: boolean
}

export type InputProps = {
  /** Optional controlled state for the value of the search input. */
  value?: string
  /** Event handler called when the search value changes. */
  onValueChange?: (search: string) => void
}

export type CommandProps = {
  /** Accessible label for this command menu. Not shown visibly. */
  label?: string
  /**
   * Optionally set to `false` to turn off the automatic filtering and sorting.
   * If `false`, you must conditionally render valid items based on the search query yourself.
   */
  shouldFilter?: boolean
  /**
   * Custom filter function for whether each command menu item should matches the given search query.
   * It should return a number between 0 and 1, with 1 being the best match and 0 being hidden entirely.
   * By default, uses the `command-score` library.
   */
  filter?: CommandFilter
  /** Optional default item value when it is initially rendered. */
  defaultValue?: string
  /** Optional controlled state of the selected command menu item. */
  value?: string
  /** Optionally set to `true` to turn on looping around when using the arrow keys. */
  loop?: boolean
  /** Optionally set to `true` to disable selection via pointer events. */
  disablePointerSelection?: boolean
  /** Set to `false` to disable ctrl+n/j/p/k shortcuts. Defaults to `true`. */
  vimBindings?: boolean
}

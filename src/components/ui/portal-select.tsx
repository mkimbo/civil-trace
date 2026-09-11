'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Context to share state between components
interface SelectContextType {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  setValue: (value: string, label: string) => void
  selectedLabel: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
  name?: string
  placeholder?: string
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
  children: ReactNode
  name?: string
  defaultValue?: string
  defaultLabel?: string // Add defaultLabel prop
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
}

export function PortalSelect({
  children,
  name,
  defaultValue = '',
  defaultLabel = '', // Destructure defaultLabel
  value: controlledValue,
  onValueChange,
  placeholder,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [selectedLabel, setSelectedLabel] = useState<string>(defaultLabel) // Initialize with defaultLabel
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleSetValue = (newValue: string, newLabel: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    // Update label always so it reflects immediately
    setSelectedLabel(newLabel)
    onValueChange?.(newValue)
  }

  useEffect(() => {
    if (defaultLabel) {
      setSelectedLabel(defaultLabel)
    }
  }, [defaultLabel])

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value,
        setValue: handleSetValue,
        selectedLabel,
        triggerRef,
        name,
        placeholder,
      }}
    >
      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={value} />}
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export function PortalSelectTrigger({
  className,
  children,
  disabled,
}: {
  className?: string
  children?: ReactNode
  disabled?: boolean
}) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('PortalSelectTrigger must be used within PortalSelect')
  const { open, setOpen, triggerRef } = context

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen(!open)}
      disabled={disabled}
      className={cn(
        'border-border text-foreground bg-card flex w-full min-w-0 items-center justify-between gap-2 rounded-2xl border px-5 py-3 text-base whitespace-nowrap shadow-[var(--shadow-inset)] outline-none focus-visible:ring-[2.5px] disabled:cursor-not-allowed disabled:opacity-50 md:text-base',
        'focus-visible:border-ring focus-visible:ring-ring/50',
        'h-11', // Ensure explicit height matches Input
        className,
      )}
    >
      <div className="flex-1 text-left truncate leading-none">{children}</div>
      <ChevronDown
        className={cn('h-4 w-4 opacity-50 transition-transform duration-200', open && 'rotate-180')}
      />
    </button>
  )
}

export function PortalSelectValue({ placeholder }: { placeholder?: string }) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('PortalSelectValue must be used within PortalSelect')
  // We need to render the selected option's label.
  // Since we don't have access to children here directly to find the label,
  // we rely on the parent (SystemTemplatesSettings) passing specific children structure,
  // OR we wait for the content to render.
  //
  // However, simpler approach for this "scratch" build:
  // The trigger usually contains the value.
  // Let's implement a registry or just display the value for now if it's simple,
  // but arguably finding the label is better.
  // Given the constraints, let's look at standard Select usages.
  // Usually SelectValue renders the text content of the selected SelectItem.
  //
  // For this custom implementation, let's use a workaround:
  // We will let the trigger render the "selected label" state if we can store it.
  // But wait, standard Radix does this by magic.
  // Let's rely on `children` mapping or just context.

  // Actually, to keep it simple and robust without heavy cloning:
  // We will store the "Selected Label" in state too.

  const { value, selectedLabel, placeholder: contextPlaceholder } = context
  // This part is tricky in a detached headless-like component without a large library.
  // WE will assume for now the user is okay with us rendering specific things, OR
  // we add a `label` to `PortalSelectItem` and update it on click.

  // If we have a selected label, show it.
  // If not, but we have a value (e.g. initial load), try to show value or wait for hydration?
  // Ideally, on mount, we should find the label from children match.
  // But since we can't easily traverse children in this structure:
  // We will display value if label is missing (fallback).
  const display = selectedLabel || value

  return (
    <span className={cn(!value && 'text-muted-foreground')}>
      {display || placeholder || contextPlaceholder}
    </span>
  )
}

// A context to register labels for values - improvement for "SelectValue"
// But let's build the core first. user wants it fixed.
// Let's make PortalSelectValue simplified: it just renders context.value
// (or preferably we pass a display map? No that's ugly).
//
// Let's use a "selectedLabel" state in the context.

interface ContentProps {
  children: ReactNode
  className?: string
}

export function PortalSelectContent({ children, className }: ContentProps) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('PortalSelectContent must be used within PortalSelect')
  const { open, setOpen } = context

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-transparent cursor-default"
        onClick={() => setOpen(false)} // Overlay to close
      />
      <div
        className={cn(
          'bg-card text-card-foreground absolute left-0 top-full mt-1 z-50 rounded-xl border border-border shadow-[var(--shadow-card)] overflow-y-auto max-h-96 p-1 w-full min-w-[8rem]',
          className,
        )}
      >
        {children}
      </div>
    </>
  )
}

interface ItemProps {
  value: string
  children: ReactNode
  className?: string
}

export function PortalSelectItem({ value, children, className }: ItemProps) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('PortalSelectItem must be used within PortalSelect')
  const { value: selectedValue, setValue, setOpen } = context

  const isSelected = selectedValue === value

  // Update label if selected on mount/update - simplified auto-registration
  // This is a bit hacky but works for simple cases:
  useEffect(() => {
    if (isSelected && children) {
      // extract text content from children roughly
      let label = ''
      if (typeof children === 'string') label = children
      else if (Array.isArray(children))
        label = children.map((c) => (typeof c === 'string' ? c : '')).join('')
      // Fallback for complex children
      if (!label && React.isValidElement(children)) {
        // Cannot easily extract.
      }
      // Actually, let's just use the children as passed if possible or just use a ref?
    }
  }, [isSelected, children])

  // Better: On click, we know the children.
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent bubbling to content overlay
    // Get text content from the rendered item for the label
    const textContent = (e.currentTarget as HTMLElement).textContent || ''
    setValue(value, textContent)
    setOpen(false)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted/50 transition-colors cursor-pointer',
        isSelected && 'bg-muted',
        className,
      )}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        {isSelected && <Check className="size-4" />}
      </span>
      <span>{children}</span>
    </div>
  )
}

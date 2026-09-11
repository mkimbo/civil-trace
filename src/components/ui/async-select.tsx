'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Generic type for any option that has an id and a display label
export interface Selectable {
  id: string
  [key: string]: any // Allow other properties
}

interface AsyncSelectProps<T extends Selectable> {
  // The async function to call to fetch options
  loadOptions: (query: string) => Promise<T[]>
  // The currently selected value object
  value: T | null
  // The function to call when a value is selected or cleared
  onValueChange: (value: T | null) => void
  // A function to get the display label from an option object
  getOptionLabel: (option: T) => string
  placeholder?: string
  className?: string
}

export function AsyncSelect<T extends Selectable>({
  loadOptions,
  value,
  onValueChange,
  getOptionLabel,
  placeholder = 'Select an option...',
  className,
}: AsyncSelectProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [options, setOptions] = React.useState<T[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Debounce effect for fetching options
  React.useEffect(() => {
    // Don't fetch if the popover is closed
    if (!open) return

    const handler = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true)
        const results = await loadOptions(searchQuery)
        setOptions(results)
        setIsLoading(false)
      } else {
        setOptions([])
      }
    }, 300) // 300ms debounce delay

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery, loadOptions, open])

  const handleSelect = (option: T) => {
    onValueChange(option)
    setOpen(false)
    setSearchQuery('') // Reset search on select
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent popover from opening
    onValueChange(null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          <span className="truncate">{value ? getOptionLabel(value) : placeholder}</span>
          <div className="flex items-center">
            {value && <X className="h-3 w-3 mr-1" onClick={handleClear} />}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        side="bottom" // Explicitly tell it to open downwards
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="mt-0"
          />
          <CommandList>
            {isLoading && (
              <div className="p-2 flex justify-center items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!isLoading && searchQuery.length >= 2 && options.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={getOptionLabel(option)} // Command uses this for filtering if needed
                  onSelect={() => handleSelect(option)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value?.id === option.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {getOptionLabel(option)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

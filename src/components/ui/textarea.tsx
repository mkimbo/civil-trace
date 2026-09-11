import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-border placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-card flex field-sizing-content min-h-20 w-full rounded-2xl border px-5 py-3 text-base shadow-[inset_2px_2px_5px_rgba(255,255,255,0.4),inset_-3px_-3px_7px_rgba(0,0,0,0.15)] dark:shadow-[inset_2px_2px_5px_rgba(255,255,255,0.1),inset_-3px_-3px_7px_rgba(0,0,0,0.5)] transition-all duration-200 outline-none focus-visible:ring-[2.5px] focus-visible:shadow-[inset_2px_2px_5px_rgba(255,255,255,0.4),inset_-3px_-3px_7px_rgba(0,0,0,0.15),0_0_0_4px_var(--ring)/0.15] dark:focus-visible:shadow-[inset_2px_2px_5px_rgba(255,255,255,0.1),inset_-3px_-3px_7px_rgba(0,0,0,0.5),0_0_0_4px_var(--ring)/0.25] disabled:cursor-not-allowed disabled:opacity-50 md:text-base resize-none',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }

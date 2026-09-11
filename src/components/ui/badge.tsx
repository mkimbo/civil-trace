import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2.5px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-md)]',
        secondary: 'border-border bg-secondary text-secondary-foreground shadow-[var(--shadow-md)]',
        destructive:
          'border-destructive bg-destructive text-destructive-foreground shadow-[4px_4px_8px_rgba(220,38,38,0.08),-4px_-4px_8px_rgba(255,255,255,0.3),inset_2px_2px_5px_rgba(255,255,255,0.2),inset_-2px_-2px_5px_rgba(0,0,0,0.15)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline: 'border-border bg-card text-foreground shadow-[var(--shadow-md)]',
      },
    },

    defaultVariants: {
      variant: 'default',
    },
  },
)

const badgeSizeVariants = cva(
  'inline-flex items-center justify-center rounded-full border text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2.5px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden',
  {
    variants: {
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  size = 'sm',
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), badgeSizeVariants({ size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none  aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.3)] active:scale-98",
  {
    variants: {
      variant: {
        default:
          '[--shadow-md:var(--shadow-md)] bg-primary text-primary-foreground shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-md-hover)]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[5px_5px_10px_rgba(220,38,38,0.2),-5px_-5px_10px_rgba(255,255,255,0.4),inset_2px_2px_5px_rgba(255,255,255,0.2),inset_-2px_-2px_5px_rgba(0,0,0,0.15)] hover:shadow-[7px_7px_12px_rgba(220,38,38,0.25),-7px_-7px_12px_rgba(255,255,255,0.5)]',
        outline:
          'bg-card text-foreground shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-md-hover)] dark:bg-card',
        secondary:
          'bg-secondary text-secondary-foreground shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-md-hover)]',
        ghost: 'text-foreground hover:bg-accent/10 hover:shadow-[var(--shadow-sm)]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-7 py-2.5 has-[>svg]:px-4',
        sm: 'h-9 rounded-xl gap-1.5 px-5 has-[>svg]:px-3 text-sm',
        lg: 'h-13 rounded-2xl px-10 has-[>svg]:px-5 text-base',
        icon: 'size-11',
        'icon-sm': 'size-9 rounded-2xl',
        'icon-lg': 'size-13 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

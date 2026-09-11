'use client'

import { useFormStatus } from 'react-dom'
import { Button, ButtonProps } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const SubmitButton = ({ children, className, ...props }: ButtonProps) => {
  const { pending } = useFormStatus()

  return (
    <Button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      className={cn('border-none relative flex items-center justify-center', className)}
    >
      <div
        className={cn(
          'flex items-center justify-center gap-2 transition-all duration-200',
          pending ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
        )}
      >
        {children}
      </div>
      {pending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-current" />
        </div>
      )}
    </Button>
  )
}

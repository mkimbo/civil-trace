'use client'

import React from 'react'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useGlobalDialogStore } from './store'

export function GlobalDialog() {
  const { isOpen, view, options, close } = useGlobalDialogStore()
  const { variant = 'default', className, maxWidth, showCloseButton } = options

  const getVariantProps = () => {
    switch (variant) {
      case 'fullscreen':
        return {
          variant: 'fullscreen' as const,
          className: 'max-w-none w-screen h-screen p-0 sm:rounded-none border-none',
        }
      case 'scrollUp':
        return {
          variant: 'bottomSheet' as const,
          className:
            'max-w-none w-full border-b-0 rounded-b-none rounded-t-xl sm:max-w-none max-h-[85vh]',
        }
      default:
        return {
          variant: 'default' as const,
          className: maxWidth || 'sm:max-w-lg',
        }
    }
  }

  // Handle interaction outside - prevent closing
  const onInteractOutside = (e: Event) => {
    e.preventDefault()
  }

  const { variant: dialogVariant, className: variantClassName } = getVariantProps()

  return (
    <Dialog open={isOpen} onOpenChange={(val: any) => !val && close()}>
      <DialogTitle className="sr-only" />
      <DialogContent
        variant={dialogVariant}
        className={cn(variantClassName, className)}
        onInteractOutside={onInteractOutside}
        showCloseButton={showCloseButton}
      >
        {view}
      </DialogContent>
    </Dialog>
  )
}

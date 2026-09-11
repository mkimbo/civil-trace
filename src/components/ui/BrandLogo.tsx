'use client'

import Link from 'next/link'
import { LogoIcon } from './LogoIcon'

export function BrandLogo({ hideLabel }: { hideLabel?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <LogoIcon className="h-10 w-auto text-foreground transition-all group-hover:scale-105 duration-300 ease-out" />
      {!hideLabel && (
        <span className="font-semibold text-3xl tracking-tighter text-foreground">Patofy</span>
      )}
    </Link>
  )
}

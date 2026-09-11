import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/context/theme-provider'
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0f2f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f17' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'CivilTrace Kenya — Community Safety & Incident Recovery Mesh',
  description: 'Community-driven missing persons and stolen vehicle/motorbike recovery platform in Kenya.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CivilTrace',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-background text-foreground overflow-x-hidden w-full max-w-full">
        <ThemeProvider>
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
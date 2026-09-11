import { withSentryConfig } from '@sentry/nextjs/config'
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

export default withSentryConfig(withPayload(nextConfig), {
  silent: true,
  widenClientFileUpload: false,
  hideSourceMaps: true,
  sourcemaps: {
    disable: true,
  },
})
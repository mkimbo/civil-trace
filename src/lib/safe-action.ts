import * as Sentry from '@sentry/nextjs'

export type Result<T, E = Error> =
  | { ok: true; value: T; error?: never }
  | { ok: false; error: E; value: T }

type SafeOptions<T> = {
  contextName: string
  fallbackValue: T
  extraContext?: Record<string, any>
  shouldRethrow?: boolean
}

export const withSafeAction = <T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  options: SafeOptions<T>,
) => {
  return async (...args: Args): Promise<Result<T>> => {
    try {
      const data = await fn(...args)
      return {
        ok: true,
        value: data,
      }
    } catch (error: any) {
      console.error(`[${options.contextName}] Failed:`, error)

      Sentry.captureException(error, {
        extra: {
          function: options.contextName,
          arguments: args,
          ...options.extraContext,
        },
        tags: {
          mechanism: 'safe-action-wrapper',
        },
      })

      if (options.shouldRethrow) {
        throw error
      }

      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
        value: options.fallbackValue,
      }
    }
  }
}

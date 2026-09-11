import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/admin']
const CLIENT_AUTH_ROUTES = ['/login', '/verify']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('payload-token')?.value
  const requestHeaders = new Headers(request.headers)

  const isAccessingProtectedRoute = PROTECTED_ROUTES.some((prefix) => pathname.startsWith(prefix))
  const isAccessingAuthRoute = CLIENT_AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (isAccessingProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token && isAccessingAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  requestHeaders.set('next-url', `${baseUrl}${pathname}${request.nextUrl.search}`)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
}

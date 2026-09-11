import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseListParams(params: { [key: string]: string | string[] | undefined }) {
  const page = Number(params?.page) || 1
  const limit = Number(params?.limit) || 10
  const sort = (params?.sort as string) || '-createdAt'
  const search = (params?.search as string) || ''

  return { page, limit, sort, search }
}

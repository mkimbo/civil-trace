import { notFound } from 'next/navigation'
import { getAlertById } from '@/lib/payload/getAlertById'
import { AlertDetailClient } from './AlertDetailClient'

interface AlertDetailServerProps {
  id: string
}

export async function AlertDetailServer({ id }: AlertDetailServerProps) {
  const result = await getAlertById(id)
  const alert = result.value

  if (!alert) {
    notFound()
  }

  return <AlertDetailClient alert={alert} />
}

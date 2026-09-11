import { getDirectoryStations } from '@/lib/payload/getDirectoryStations'
import { DirectoryClient } from './DirectoryClient'

interface DirectoryServerProps {
  county?: string
  search?: string
}

export async function DirectoryServer({ county, search }: DirectoryServerProps) {
  const result = await getDirectoryStations(county, search)
  const stations = result.value || []

  return (
    <DirectoryClient
      initialStations={stations}
      initialCounty={county}
      initialSearch={search}
    />
  )
}

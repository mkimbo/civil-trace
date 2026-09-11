import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Alerts } from './collections/Alerts'
import { Sightings } from './collections/Sightings'
import { CivicPointLedger } from './collections/CivicPointLedger'
import { Transactions } from './collections/Transactions'
import { OCSDirectory } from './collections/OCSDirectory'
import { AuditLogs } from './collections/AuditLogs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Media,
    Users,
    Alerts,
    Sightings,
    CivicPointLedger,
    Transactions,
    OCSDirectory,
    AuditLogs,
  ],
  globals: [],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'civil-trace-dev-secret-key-32-chars-long-minimum',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || 'mongodb://localhost:27017/civil-trace',
  }),
  sharp,
})

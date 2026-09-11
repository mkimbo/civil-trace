import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateHTMLPoster } from '@/lib/pdf-generator/poster'

export const dynamic = 'force-dynamic'

function extractTextFromLexical(lexical: any): string {
  if (!lexical) return ''
  if (typeof lexical === 'string') return lexical
  try {
    const root = lexical.root || lexical
    const texts: string[] = []
    function traverse(node: any) {
      if (!node) return
      if (node.text) texts.push(node.text)
      if (Array.isArray(node.children)) {
        node.children.forEach(traverse)
      }
    }
    traverse(root)
    return texts.join('\n')
  } catch {
    return ''
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    const alert = await payload.findByID({
      collection: 'alerts',
      id,
      depth: 1,
    })

    if (!alert) {
      return new NextResponse('Alert not found', { status: 404 })
    }

    const photoDoc: any = alert.photo
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const photoUrl = photoDoc?.url
      ? photoDoc.url
      : photoDoc?.filename
      ? `${serverUrl}/media/${photoDoc.filename}`
      : undefined

    const descriptionText = extractTextFromLexical(alert.description)

    let html = generateHTMLPoster({
      id: alert.id,
      title: alert.title,
      category: alert.category,
      obNumber: alert.obNumber,
      policeStation: alert.policeStation,
      lastSeenLocation: alert.lastSeenLocationName || 'Kenya',
      lastSeenDate: alert.lastSeenDate ? new Date(alert.lastSeenDate).toLocaleDateString('en-GB') : undefined,
      description: descriptionText || 'No distinguishing description provided.',
      contactPhone: alert.contactPhone || 'Police Hotline: 999 / 112',
      photoUrl,
    })

    const { searchParams } = new URL(req.url)
    if (searchParams.get('print') === 'true') {
      html = html.replace('</body>', '<script>window.onload = function() { window.print(); };</script></body>')
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error: any) {
    console.error('Error generating alert poster:', error)
    return new NextResponse('Failed to generate poster', { status: 500 })
  }
}

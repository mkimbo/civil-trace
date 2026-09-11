export interface AlertPosterData {
  id: string
  title: string
  category: string
  obNumber: string
  policeStation: string
  lastSeenLocation: string
  lastSeenDate?: string
  description: string
  contactPhone: string
  photoUrl?: string
}

export function generateHTMLPoster(alert: AlertPosterData): string {
  const categoryTitle = alert.category === 'missing-person' ? 'MISSING PERSON' : 'STOLEN VEHICLE / MOTORBIKE'
  const accentColor = alert.category === 'missing-person' ? '#dc2626' : '#ea580c'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CivilTrace Emergency Poster - ${alert.obNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; color: #111; }
    .header { background: ${accentColor}; color: white; text-align: center; padding: 25px; border-radius: 12px; }
    .header h1 { margin: 0; font-size: 38px; font-weight: 900; letter-spacing: 2px; }
    .header p { margin: 5px 0 0; font-size: 16px; font-weight: bold; }
    .ob-badge { background: #fef08a; color: #854d0e; display: inline-block; padding: 6px 14px; border-radius: 8px; font-weight: bold; font-family: monospace; font-size: 16px; margin-top: 15px; }
    .content { margin-top: 25px; display: flex; gap: 20px; }
    .photo-box { width: 45%; height: 320px; border: 3px dashed #cbd5e1; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-size: 14px; color: #64748b; text-align: center; }
    .details { width: 55%; font-size: 16px; line-height: 1.6; }
    .details strong { color: #0f172a; }
    .footer { margin-top: 30px; border-top: 2px solid #e2e8f0; padding-top: 20px; text-align: center; }
    .phone-box { background: #ea580c; color: white; display: inline-block; padding: 12px 28px; border-radius: 10px; font-size: 22px; font-weight: 900; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${categoryTitle}</h1>
    <p>CIVILTRACE KENYA COMMUNITY EMERGENCY ALERT</p>
    <div class="ob-badge">${alert.obNumber} • ${alert.policeStation}</div>
  </div>

  <div class="content">
    <div class="photo-box">
      ${alert.photoUrl ? `<img src="${alert.photoUrl}" style="max-width:100%; max-height:100%; border-radius:8px;" />` : '[ PHOTOGRAPH ATTACHED ]'}
    </div>
    <div class="details">
      <h2 style="margin-top:0; font-size: 24px;">${alert.title}</h2>
      <p><strong>Last Known Location:</strong> ${alert.lastSeenLocation}</p>
      <p><strong>Reported Date:</strong> ${alert.lastSeenDate || 'Recent'}</p>
      <p><strong>Description & Distinguishing Features:</strong></p>
      <p>${alert.description}</p>
    </div>
  </div>

  <div class="footer">
    <p style="font-size: 14px; margin-bottom: 10px;">IF YOU HAVE ANY INFORMATION OR SIGHTINGS, PLEASE CALL IMMEDIATELY:</p>
    <div class="phone-box">☎ ${alert.contactPhone}</div>
    <p style="font-size: 12px; color: #64748b; margin-top: 15px;">Report verified sightings online at https://civiltrace.org or dial national police 999 / 112</p>
  </div>
</body>
</html>`
}
import { GoogleGenAI } from '@google/genai'

export interface ParityResult {
  score: number // 0 - 100
  reasoning: string
}

export async function checkParity(
  uploadedImageUrl: string,
  socialMediaText: string,
  socialMediaImageUrl: string | null
): Promise<ParityResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return {
      score: 75,
      reasoning: 'AI verification key not configured. Queued for human moderation.',
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const prompt = `You are a forensic civil triage verification agent for CivilTrace Kenya.
Analyze the following alert data and determine if the social media post and submitted alert correspond to the same incident:
Social Media Context: ${socialMediaText}
Submitted Image: ${uploadedImageUrl}
${socialMediaImageUrl ? `Social Media OG Image: ${socialMediaImageUrl}` : ''}

Rate the confidence from 0 to 100 that this alert corresponds to an authentic, matching civil emergency report.
Return ONLY JSON: {"score": number, "reasoning": "brief explanation"}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const text = response.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
        reasoning: parsed.reasoning || 'Automated parity assessment completed.',
      }
    }

    return {
      score: 70,
      reasoning: text.slice(0, 250),
    }
  } catch (error: any) {
    console.error('AI Parity Check Error:', error)
    return {
      score: 50,
      reasoning: `AI verification encountered error: ${error.message || 'unknown error'}. Requires moderator review.`,
    }
  }
}

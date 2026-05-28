const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

interface AnthropicTextBlock {
  type: 'text'
  text: string
}

interface AnthropicResponse {
  content: AnthropicTextBlock[]
}

export async function askClaudeJson<T>(system: string, prompt: string): Promise<T> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY manquante')
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      system,
      max_tokens: 1200,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Erreur Anthropic (${res.status}): ${body}`)
  }

  const payload = (await res.json()) as AnthropicResponse
  const text = payload.content.find((c) => c.type === 'text')?.text
  if (!text) {
    throw new Error('Réponse Anthropic vide')
  }

  return JSON.parse(text) as T
}

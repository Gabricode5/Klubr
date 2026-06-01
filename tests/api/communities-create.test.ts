import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'
import { createSupabaseMock } from '../helpers/supabase-mock'

vi.mock('@/lib/supabase-server', () => ({
  createAdminClient: vi.fn(),
  createServerSupabaseClient: vi.fn(),
}))

import { POST } from '@/app/api/creator/communities/create/route'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server'

const mockUser = { id: 'user-uuid-1234', email: 'creator@example.com' }

const validBody = {
  name: 'Ma Communauté Trading',
  description: 'Signaux quotidiens',
  platform: 'telegram',
  slug: 'trading-signals',
  botToken: '1234567890:AAFakeToken',
  platformId: '-100987654321',
}

function makeRequest(body: unknown): NextRequest {
  return {
    json: () => Promise.resolve(body),
    headers: { get: () => null },
    method: 'POST',
    url: 'http://localhost/api/creator/communities/create',
  } as unknown as NextRequest
}

function setupAuth(user: typeof mockUser | null) {
  vi.mocked(createServerSupabaseClient).mockResolvedValue(
    createSupabaseMock({ '__user__': user }) as unknown as Awaited<ReturnType<typeof createServerSupabaseClient>>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/creator/communities/create', () => {
  it("retourne 401 si l'utilisateur n'est pas authentifié", async () => {
    setupAuth(null)

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Non autorisé')
  })

  it('retourne 400 si les champs obligatoires sont manquants', async () => {
    setupAuth(mockUser)
    vi.mocked(createAdminClient).mockReturnValue(
      createSupabaseMock() as unknown as ReturnType<typeof createAdminClient>
    )

    const res = await POST(makeRequest({ description: 'Sans nom ni slug ni platform' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Champs manquants')
  })

  it('retourne 409 si le slug est déjà pris', async () => {
    setupAuth(mockUser)
    vi.mocked(createAdminClient).mockReturnValue(
      createSupabaseMock({
        creators: { data: {}, error: null },
        communities: { data: null, error: { code: '23505', message: 'duplicate key' } },
      }) as unknown as ReturnType<typeof createAdminClient>
    )

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toContain('slug')
  })

  it('retourne 200 avec la communauté créée en cas de succès', async () => {
    const createdCommunity = { id: 'new-community-id', ...validBody, active: true }
    setupAuth(mockUser)
    vi.mocked(createAdminClient).mockReturnValue(
      createSupabaseMock({
        creators: { data: {}, error: null },
        communities: { data: createdCommunity, error: null },
      }) as unknown as ReturnType<typeof createAdminClient>
    )

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.community.id).toBe('new-community-id')
    expect(json.community.slug).toBe('trading-signals')
  })
})

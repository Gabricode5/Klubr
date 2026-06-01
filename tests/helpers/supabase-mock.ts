/**
 * Crée un mock du client Supabase avec support des chaînes de méthodes.
 * Chaque table peut avoir une réponse par défaut configurée.
 */
export function createSupabaseMock(tableResponses: Record<string, unknown> = {}) {
  const makeChain = (data: unknown): Record<string, unknown> => {
    const chain: Record<string, unknown> = {
      select: () => makeChain(data),
      eq: () => makeChain(data),
      is: () => makeChain(data),
      not: () => makeChain(data),
      order: () => makeChain(data),
      limit: () => makeChain(data),
      single: () => Promise.resolve(data),
      insert: () => makeChain(data),
      update: () => makeChain(data),
      upsert: () => Promise.resolve(data),
      delete: () => makeChain(data),
      then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
        Promise.resolve(data).then(resolve, reject),
    }
    return chain
  }

  return {
    from: (table: string) =>
      makeChain(tableResponses[table] ?? { data: null, error: null }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: tableResponses['__user__'] ?? null },
          error: null,
        }),
    },
  }
}

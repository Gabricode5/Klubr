'use client'

import { useMemo, useState } from 'react'

interface CountryTaxRow {
  country: string
  tax_collected: number
  total_amount: number
  currency: string
}

export default function FiscalitePage() {
  const [rows, setRows] = useState<CountryTaxRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const start = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  }, [])
  const end = useMemo(() => new Date().toISOString(), [])

  async function loadReport() {
    setLoading(true)
    const res = await fetch(`/api/tax/report?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
    const payload = (await res.json()) as { countries: CountryTaxRow[]; total_tax_collected: number }
    setRows(payload.countries ?? [])
    setTotal(payload.total_tax_collected ?? 0)
    setLoading(false)
    setLoaded(true)
  }

  function exportCsv() {
    const header = 'country,tax_collected,total_amount,currency'
    const csv = [header, ...rows.map((r) => `${r.country},${r.tax_collected},${r.total_amount},${r.currency}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tax-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Fiscalité</h1>
        <p className="mt-1 text-sm text-slate-500">TVA collectée ce mois, répartition par pays.</p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={loadReport}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Charger le rapport'}
        </button>
        {rows.length > 0 && (
          <button
            onClick={exportCsv}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            Exporter CSV
          </button>
        )}
      </div>

      {loaded && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">TVA collectée ce mois</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{total.toFixed(2)} €</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {!loaded ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Cliquez sur "Charger le rapport" pour afficher les données.
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl">📊</p>
            <p className="mt-3 font-medium text-slate-700">Aucune transaction ce mois</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Pays</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">TVA collectée</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Total TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.country} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{row.country}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {row.tax_collected.toFixed(2)} {row.currency.toUpperCase()}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {row.total_amount.toFixed(2)} {row.currency.toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

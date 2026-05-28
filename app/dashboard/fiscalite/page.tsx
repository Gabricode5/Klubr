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
  }

  function exportCsv() {
    const header = 'country,tax_collected,total_amount,currency'
    const csv = [header, ...rows.map((r) => `${r.country},${r.tax_collected},${r.total_amount},${r.currency}`)].join(
      '\n'
    )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tax-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">Fiscalité</h1>
      <p className="mt-2 text-sm text-gray-600">TVA collectée ce mois, avec répartition par pays.</p>
      <div className="mt-4 flex gap-3">
        <button className="rounded bg-black px-4 py-2 text-white" onClick={() => loadReport()}>
          {loading ? 'Chargement...' : 'Rafraîchir'}
        </button>
        <button className="rounded border px-4 py-2" onClick={() => exportCsv()} disabled={rows.length === 0}>
          Export CSV
        </button>
      </div>
      <p className="mt-4 text-sm">
        TVA collectée ce mois: <strong>{total.toFixed(2)} EUR</strong>
      </p>
      <div className="mt-4 overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Pays</th>
              <th className="p-3">TVA</th>
              <th className="p-3">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.country} className="border-t">
                <td className="p-3">{row.country}</td>
                <td className="p-3">
                  {row.tax_collected.toFixed(2)} {row.currency.toUpperCase()}
                </td>
                <td className="p-3">
                  {row.total_amount.toFixed(2)} {row.currency.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { sendRawEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 1)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!appUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL manquante' }, { status: 500 })
    }

    const reportRes = await fetch(
      `${appUrl}/api/tax/report?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(
        end.toISOString()
      )}`
    )
    const report = (await reportRes.json()) as {
      countries: { country: string; tax_collected: number; total_amount: number; currency: string }[]
      total_tax_collected: number
    }

    const supabase = createAdminClient()
    const { data: creators } = await supabase.from('creators').select('user_id')

    let sent = 0
    for (const creator of creators ?? []) {
      const user = await supabase.auth.admin.getUserById(creator.user_id)
      const email = user.data.user?.email
      if (!email) continue

      const rows = report.countries
        .map(
          (row) =>
            `<tr><td>${row.country}</td><td>${row.tax_collected.toFixed(2)} ${row.currency.toUpperCase()}</td><td>${row.total_amount.toFixed(2)} ${row.currency.toUpperCase()}</td></tr>`
        )
        .join('')

      await sendRawEmail({
        to: email,
        subject: 'Rapport TVA mensuel',
        html: `<div style="font-family:sans-serif;max-width:700px;margin:0 auto">
          <h2>Rapport TVA mensuel</h2>
          <p>Total TVA collectée: <strong>${report.total_tax_collected.toFixed(2)} EUR</strong></p>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr><th style="text-align:left">Pays</th><th style="text-align:left">TVA</th><th style="text-align:left">Total TTC</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`,
      })
      sent += 1
    }

    return NextResponse.json({ sent })
  } catch (error) {
    console.error('Erreur monthly tax email:', error)
    return NextResponse.json({ error: 'Failed monthly tax email' }, { status: 500 })
  }
}

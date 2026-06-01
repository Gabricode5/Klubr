import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

const QuerySchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = QuerySchema.parse({
      start: searchParams.get('start'),
      end: searchParams.get('end'),
    })

    // stripe.tax.transactions.list typing changed in 2025-08-27.basil
    const transactions = await (stripe.tax.transactions as unknown as { list: (p: object) => Promise<{ data: Stripe.Tax.Transaction[] }> }).list({
      created: {
        gte: Math.floor(new Date(parsed.start).getTime() / 1000),
        lte: Math.floor(new Date(parsed.end).getTime() / 1000),
      },
      expand: ['data.line_items'],
      limit: 100,
    })

    const perCountry: Record<string, { tax: number; total: number; currency: string }> = {}
    for (const transaction of transactions.data) {
      const country = transaction.customer_details?.address?.country ?? 'UNKNOWN'
      const tax = (transaction.tax_amount_exclusive ?? 0) / 100
      const total = (transaction.amount_total ?? 0) / 100
      const current = perCountry[country] ?? { tax: 0, total: 0, currency: transaction.currency }
      current.tax += tax
      current.total += total
      perCountry[country] = current
    }

    return NextResponse.json({
      start: parsed.start,
      end: parsed.end,
      countries: Object.entries(perCountry).map(([country, values]) => ({
        country,
        tax_collected: Number(values.tax.toFixed(2)),
        total_amount: Number(values.total.toFixed(2)),
        currency: values.currency,
      })),
      total_tax_collected: Number(
        Object.values(perCountry)
          .reduce((sum, value) => sum + value.tax, 0)
          .toFixed(2)
      ),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
    }
    console.error('Erreur tax report:', error)
    return NextResponse.json({ error: 'Failed to build tax report' }, { status: 500 })
  }
}

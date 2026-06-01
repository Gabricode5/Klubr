import { describe, it, expect } from 'vitest'
import { calculateFees } from '@/lib/stripe'

describe('calculateFees', () => {
  it('calcule les frais sans affilié', () => {
    const result = calculateFees(100, 0.15)
    expect(result.platformFee).toBe(15)
    expect(result.affiliateFee).toBe(0)
    expect(result.creatorAmount).toBe(85)
  })

  it('calcule les frais avec affilié à 20%', () => {
    const result = calculateFees(100, 0.15, 0.2)
    expect(result.platformFee).toBe(15)
    expect(result.affiliateFee).toBe(20)
    expect(result.creatorAmount).toBe(65)
  })

  it('arrondit les centimes correctement', () => {
    // 33.33 * 0.15 = 4.9995 → arrondi à 5.00
    const result = calculateFees(33.33, 0.15)
    expect(result.platformFee).toBe(5)
    expect(result.affiliateFee).toBe(0)
    expect(result.creatorAmount).toBe(28.33)
    expect(result.platformFee + result.affiliateFee + result.creatorAmount).toBeCloseTo(33.33, 2)
  })

  it('retourne zéro partout pour un montant nul', () => {
    const result = calculateFees(0, 0.15, 0.2)
    expect(result.platformFee).toBe(0)
    expect(result.affiliateFee).toBe(0)
    expect(result.creatorAmount).toBe(0)
  })

  it('la somme des frais égale toujours le montant total', () => {
    const cases = [
      { amount: 9.99, commission: 0.15, affiliate: 0 },
      { amount: 49.99, commission: 0.04, affiliate: 0.2 },
      { amount: 199, commission: 0.15, affiliate: 0 },
      { amount: 1, commission: 0.15, affiliate: 0.2 },
    ]
    for (const { amount, commission, affiliate } of cases) {
      const { platformFee, affiliateFee, creatorAmount } = calculateFees(amount, commission, affiliate)
      expect(platformFee + affiliateFee + creatorAmount).toBeCloseTo(amount, 1)
    }
  })

  it('commission Business Plan à 4% réduit les frais plateforme', () => {
    const freemium = calculateFees(100, 0.15)
    const business = calculateFees(100, 0.04)
    expect(business.platformFee).toBeLessThan(freemium.platformFee)
    expect(business.creatorAmount).toBeGreaterThan(freemium.creatorAmount)
  })
})

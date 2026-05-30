'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Step = 'info' | 'platform' | 'connect' | 'pricing' | 'done'
type Platform = 'telegram' | 'discord' | 'whatsapp'

interface BotInfo { username: string; first_name: string }
interface PlanRow { name: string; price: string; interval: string; trialDays: string }

const DEFAULT_PLAN: PlanRow = { name: '', price: '', interval: 'month', trialDays: '0' }

export default function NewCommunityPage() {
  const router = useRouter()
  const supabase = createClient()

  // Info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Platform
  const [platform, setPlatform] = useState<Platform>('telegram')

  // Connect
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null)
  const [validating, setValidating] = useState(false)
  const [tokenError, setTokenError] = useState('')

  // Pricing
  const [plans, setPlans] = useState<PlanRow[]>([{ ...DEFAULT_PLAN, name: 'Accès mensuel', price: '9', interval: 'month' }])

  // Flow
  const [step, setStep] = useState<Step>('info')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [payUrl, setPayUrl] = useState('')

  const steps: Step[] = ['info', 'platform', 'connect', 'pricing']
  const stepLabels = ['Infos', 'Plateforme', 'Connexion', 'Tarifs']

  function updatePlan(i: number, field: keyof PlanRow, value: string) {
    setPlans((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))
  }
  function addPlan() { setPlans((p) => [...p, { ...DEFAULT_PLAN }]) }
  function removePlan(i: number) { setPlans((p) => p.filter((_, idx) => idx !== i)) }

  async function validateToken() {
    setValidating(true)
    setTokenError('')
    setBotInfo(null)
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/getMe`)
      const data = await res.json()
      if (!data.ok) throw new Error()
      setBotInfo({ username: data.result.username, first_name: data.result.first_name })
    } catch {
      setTokenError('Token invalide. Vérifiez la copie depuis @BotFather.')
    } finally {
      setValidating(false)
    }
  }

  async function save() {
    setSaving(true)
    setSaveError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const res = await fetch('/api/creator/communities/create-with-plans', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        creatorId: user.id,
        name, description, platform, slug,
        botToken: botToken.trim(),
        platformId: chatId.trim(),
        plans: plans.map((p) => ({
          name: p.name,
          price: parseFloat(p.price),
          interval: p.interval,
          trialDays: parseInt(p.trialDays) || 0,
        })),
      }),
    })

    if (res.ok) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      setPayUrl(`${appUrl}/pay/${slug}`)
      setStep('done')
    } else {
      const payload = await res.json().catch(() => ({}))
      setSaveError((payload as { error?: string }).error ?? 'Une erreur est survenue.')
    }
    setSaving(false)
  }

  if (step === 'done') {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">🎉</div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">C'est lancé !</h1>
          <p className="mb-2 text-sm text-slate-500">Votre communauté et vos plans sont prêts. Partagez ce lien pour recevoir vos premiers abonnés :</p>
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 break-all">{payUrl}</div>
          <div className="flex flex-col gap-3">
            <button onClick={() => { navigator.clipboard.writeText(payUrl) }} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Copier le lien de paiement
            </button>
            <button onClick={() => router.push('/dashboard')} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
              Retour au dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Créer une communauté</h1>
        <p className="mt-1 text-sm text-slate-500">Connectez votre groupe et définissez vos tarifs en une seule fois.</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step === s ? 'bg-indigo-600 text-white'
              : steps.indexOf(step) > i ? 'bg-emerald-500 text-white'
              : 'bg-slate-200 text-slate-500'
            }`}>
              {steps.indexOf(step) > i ? '✓' : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${step === s ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>
              {stepLabels[i]}
            </span>
            {i < steps.length - 1 && <div className="h-px w-6 bg-slate-200" />}
          </div>
        ))}
      </div>

      <div className="max-w-lg">

        {/* ── Step 1 : Info ── */}
        {step === 'info' && (
          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nom de la communauté</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Club Trading Premium"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description <span className="text-slate-400">(optionnel)</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                placeholder="Décrivez votre communauté en 1-2 phrases..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <button onClick={() => setStep('platform')} disabled={!name.trim()}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">
              Continuer →
            </button>
          </div>
        )}

        {/* ── Step 2 : Platform ── */}
        {step === 'platform' && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-700">Choisissez votre plateforme</p>
            {[
              { id: 'telegram', emoji: '✈️', label: 'Telegram', desc: 'Groupe ou canal — intégration automatique complète', ok: true },
              { id: 'discord', emoji: '🎮', label: 'Discord', desc: 'Bientôt disponible', ok: false },
              { id: 'whatsapp', emoji: '💬', label: 'WhatsApp', desc: 'Bientôt disponible', ok: false },
            ].map((p) => (
              <button key={p.id} onClick={() => p.ok && setPlatform(p.id as Platform)} disabled={!p.ok}
                className={`w-full rounded-xl border-2 p-4 text-left transition ${
                  platform === p.id && p.ok ? 'border-indigo-500 bg-indigo-50'
                  : p.ok ? 'border-slate-200 hover:border-slate-300'
                  : 'cursor-not-allowed border-slate-100 opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.desc}</p>
                  </div>
                  {!p.ok && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Bientôt</span>}
                </div>
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('info')} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Retour</button>
              <button onClick={() => setStep('connect')} className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Continuer →</button>
            </div>
          </div>
        )}

        {/* ── Step 3 : Connect ── */}
        {step === 'connect' && (
          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Connecter votre groupe Telegram</h2>

            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p className="mb-2 font-semibold text-slate-700">① Créez un bot via @BotFather</p>
              <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer"
                className="mb-3 inline-flex items-center gap-2 rounded-lg bg-[#229ED9] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                ✈️ Ouvrir @BotFather
              </a>
              <ol className="list-inside list-decimal space-y-1 text-xs text-slate-500">
                <li>Tapez <code className="rounded bg-white px-1">/newbot</code></li>
                <li>Choisissez un nom, puis un identifiant (ex: monclub_bot)</li>
                <li>Copiez le <strong>token</strong> reçu</li>
              </ol>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">② Collez le token</label>
              <div className="flex gap-2">
                <input value={botToken} onChange={(e) => { setBotToken(e.target.value); setBotInfo(null); setTokenError('') }}
                  placeholder="123456:ABC-DEF..." className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                <button onClick={validateToken} disabled={!botToken.trim() || validating}
                  className="rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40">
                  {validating ? '...' : 'Vérifier'}
                </button>
              </div>
              {tokenError && <p className="mt-1 text-xs text-red-600">{tokenError}</p>}
              {botInfo && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
                  <span className="text-emerald-500">✓</span>
                  <p className="text-xs text-emerald-700">Bot vérifié : <strong>@{botInfo.username}</strong></p>
                </div>
              )}
            </div>

            {botInfo && (
              <>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="mb-2 font-semibold text-slate-700 text-sm">③ Ajoutez le bot comme admin</p>
                  <ol className="list-inside list-decimal space-y-1 text-xs text-slate-500">
                    <li>Ouvrez votre groupe Telegram</li>
                    <li>Paramètres → Administrateurs → Ajouter</li>
                    <li>Cherchez <strong>@{botInfo.username}</strong></li>
                    <li>Activez : <em>Inviter des membres</em> + <em>Bannir des membres</em></li>
                  </ol>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">④ ID de votre groupe</label>
                  <p className="mb-2 text-xs text-slate-500">
                    Ajoutez temporairement <strong>@getidsbot</strong> dans votre groupe — il vous envoie l'ID automatiquement, puis retirez-le.
                  </p>
                  <a href="https://t.me/getidsbot" target="_blank" rel="noopener noreferrer"
                    className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline">
                    ✈️ Ouvrir @getidsbot →
                  </a>
                  <input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="-1001234567890"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                  <p className="mt-1 text-xs text-slate-400">Commence généralement par <code>-100</code></p>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('platform')} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Retour</button>
              <button onClick={() => setStep('pricing')} disabled={!botInfo || !chatId.trim()}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4 : Pricing ── */}
        {step === 'pricing' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 font-semibold text-slate-900">Vos offres d'abonnement</h2>
            <p className="mb-5 text-xs text-slate-500">Créez une ou plusieurs formules. Vous pourrez en ajouter d'autres plus tard.</p>

            <div className="space-y-4">
              {plans.map((plan, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Formule {i + 1}</p>
                    {plans.length > 1 && (
                      <button onClick={() => removePlan(i)} className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input value={plan.name} onChange={(e) => updatePlan(i, 'name', e.target.value)}
                      placeholder="Nom (ex: Accès mensuel)"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Prix (€)</label>
                        <input value={plan.price} onChange={(e) => updatePlan(i, 'price', e.target.value)}
                          type="number" min="0" step="0.01" placeholder="9.99"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Fréquence</label>
                        <select value={plan.interval} onChange={(e) => updatePlan(i, 'interval', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                          <option value="month">Mensuel</option>
                          <option value="year">Annuel</option>
                          <option value="one_time">Paiement unique</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">Jours d'essai gratuit</label>
                      <input value={plan.trialDays} onChange={(e) => updatePlan(i, 'trialDays', e.target.value)}
                        type="number" min="0" placeholder="0"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addPlan}
              className="mt-3 w-full rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600">
              + Ajouter une formule
            </button>

            {saveError && (
              <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</div>
            )}

            <div className="mt-5 flex gap-3">
              <button onClick={() => setStep('connect')} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Retour</button>
              <button onClick={save}
                disabled={saving || plans.some((p) => !p.name.trim() || !p.price)}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">
                {saving ? 'Création...' : '🚀 Créer et lancer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

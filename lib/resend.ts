import { Resend } from 'resend'

// Lazy init — avoids throwing at module load time during `next build` when env vars aren't set
let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}

type EmailTemplate = 'welcome' | 'cancelled' | 'payment_failed'

interface EmailPayload {
  to: string
  subject: string
  template: EmailTemplate
  data: Record<string, string>
}

const templates: Record<EmailTemplate, (data: Record<string, string>) => string> = {
  welcome: (data) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bienvenue dans ${data.communityName} 🎉</h2>
      <p>Salut ${data.memberName},</p>
      <p>Ton paiement a été accepté. Clique sur le bouton ci-dessous pour rejoindre la communauté :</p>
      <a href="${data.inviteLink}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
        Rejoindre la communauté
      </a>
      <p style="color:#666;font-size:12px;">Ce lien est valable 24h et à usage unique.</p>
      ${data.referralLink ? `<p>Ton lien de parrainage personnel: <a href="${data.referralLink}">${data.referralLink}</a></p>` : ''}
    </div>
  `,
  cancelled: (data) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Ton accès à ${data.communityName} a expiré</h2>
      <p>Ton abonnement a été résilié et ton accès au groupe a été révoqué.</p>
      <p>Tu peux te réabonner à tout moment :</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pay/${data.communitySlug}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
        Se réabonner
      </a>
    </div>
  `,
  payment_failed: (data) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Problème de paiement</h2>
      <p>Ton paiement pour <strong>${data.communityName}</strong> a échoué.</p>
      <p>Mets à jour tes informations de paiement pour conserver ton accès :</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pay/${data.communitySlug}" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
        Mettre à jour le paiement
      </a>
      <p style="color:#666;">Si le problème persiste dans 7 jours, ton accès sera révoqué automatiquement.</p>
    </div>
  `,
}

export async function sendEmail({ to, subject, template, data }: EmailPayload) {
  try {
    await getResend().emails.send({
      from: 'CommunityPay <noreply@communitypay.fr>',
      to,
      subject,
      html: templates[template](data),
    })
  } catch (error) {
    console.error('Erreur envoi email:', error)
  }
}

export async function sendRawEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    await getResend().emails.send({
      from: 'CommunityPay <noreply@communitypay.fr>',
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Erreur envoi email brut:', error)
  }
}

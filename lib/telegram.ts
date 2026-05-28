import { Bot } from 'grammy'

export function createTelegramBot(token: string) {
  return new Bot(token)
}

export async function generateInviteLink(
  botToken: string,
  chatId: string,
  memberName: string
): Promise<string> {
  const bot = createTelegramBot(botToken)

  const link = await bot.api.createChatInviteLink(chatId, {
    name: `Accès ${memberName}`,
    creates_join_request: false,
    member_limit: 1,
    expire_date: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  })

  return link.invite_link
}

export async function revokeMemberAccess(
  botToken: string,
  chatId: string,
  telegramUserId: number
): Promise<void> {
  const bot = createTelegramBot(botToken)

  await bot.api.banChatMember(chatId, telegramUserId, {
    until_date: Math.floor(Date.now() / 1000) + 60,
  })
}

export async function verifyBotAdmin(botToken: string, chatId: string): Promise<boolean> {
  try {
    const bot = createTelegramBot(botToken)
    const botInfo = await bot.api.getMe()
    const member = await bot.api.getChatMember(chatId, botInfo.id)
    return ['administrator', 'creator'].includes(member.status)
  } catch {
    return false
  }
}

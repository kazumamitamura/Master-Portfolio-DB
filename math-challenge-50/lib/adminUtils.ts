// 管理者メールアドレスのリスト
export const ADMIN_EMAILS = [
  'mitamuraka@haguroko.ed.jp',
  'katoyu@haguroko.ed.jp',
]

// メールアドレスが管理者かどうかをチェック
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}

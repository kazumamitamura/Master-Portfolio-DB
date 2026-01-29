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

// メールアドレスが生徒メール（s.年度.連番@haguroko.ed.jp）かどうかをチェック
export function isStudentEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const normalizedEmail = email.toLowerCase().trim()
  // s.年度(4桁).連番(4桁)@haguroko.ed.jp の形式をチェック
  const studentEmailPattern = /^s\.\d{4}\.\d{4}@haguroko\.ed\.jp$/
  return studentEmailPattern.test(normalizedEmail)
}

// メールアドレスが教員メールかどうかをチェック（管理者メールまたは教員一覧に含まれる）
export function isTeacherEmail(email: string | null | undefined): boolean {
  if (!email) return false
  // 管理者メールまたは教員メール一覧に含まれるかチェック
  // 将来的に教員メール一覧テーブルを参照する場合はここを拡張
  return isAdminEmail(email)
}

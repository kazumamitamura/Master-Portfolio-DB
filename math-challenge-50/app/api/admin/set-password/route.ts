import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabaseServer'
import { isAdminEmail } from '@/lib/adminUtils'

// 管理者メールアドレスでパスワードを直接設定（メールリンク不要）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードを入力してください。' },
        { status: 400 }
      )
    }

    if (!isAdminEmail(email)) {
      return NextResponse.json(
        { error: '管理者メールアドレスでのみパスワードを設定できます。' },
        { status: 403 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上である必要があります。' },
        { status: 400 }
      )
    }

    const adminClient = createSupabaseAdminClient()

    // メールアドレスでユーザーを検索
    const { data: authUsersData, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const user = authUsersData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase().trim()
    )

    if (!user) {
      return NextResponse.json(
        { error: 'このメールアドレスのユーザーが見つかりません。' },
        { status: 404 }
      )
    }

    // パスワードを直接更新
    const { error } = await adminClient.auth.admin.updateUserById(user.id, {
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'パスワードが設定されました。ログインしてください。',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

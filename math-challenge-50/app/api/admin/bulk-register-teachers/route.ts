import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabaseServer'
import { isAdminEmail } from '@/lib/adminUtils'
import * as XLSX from 'xlsx'

// 教員メールアドレスを一括登録（CSV/Excelアップロード）
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'ファイルが提供されていません' }, { status: 400 })
    }

    // CSV/Excelファイルを読み込む
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet) as Array<{
      [key: string]: any
    }>

    if (data.length === 0) {
      return NextResponse.json({ error: 'データが空です' }, { status: 400 })
    }

    // 列名を自動検出（email, メールアドレス, mail など）
    const emailColumn = Object.keys(data[0] || {}).find(
      (key) =>
        key.toLowerCase().includes('email') ||
        key.includes('メール') ||
        key.includes('mail') ||
        key.toLowerCase() === 'email'
    )
    const nameColumn = Object.keys(data[0] || {}).find(
      (key) =>
        key.toLowerCase().includes('name') ||
        key.includes('氏名') ||
        key.includes('名前') ||
        key.includes('name') ||
        key.includes('full_name')
    )

    if (!emailColumn) {
      return NextResponse.json(
        { error: 'CSV/Excelにメールアドレス列が見つかりません。列名に「email」「メール」を含めてください。' },
        { status: 400 }
      )
    }

    const adminClient = createSupabaseAdminClient()
    let registered = 0
    let skipped = 0
    let errors: string[] = []

    // 既存ユーザーを取得
    const { data: authUsersData, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const existingEmails = new Set(
      authUsersData.users.map((u) => u.email?.toLowerCase()).filter(Boolean)
    )

    // 各行を処理
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const email = String(row[emailColumn] || '').trim().toLowerCase()
      const fullName = nameColumn ? String(row[nameColumn] || '').trim() : '教員'

      if (!email) {
        errors.push(`行 ${i + 2}: メールアドレスが空です`)
        continue
      }

      // メールアドレス形式チェック
      if (!email.includes('@haguroko.ed.jp')) {
        errors.push(`行 ${i + 2} (${email}): @haguroko.ed.jp のメールアドレスを入力してください`)
        continue
      }

      // 生徒メールアドレスはスキップ
      if (email.match(/^s\.\d{4}\.\d{4}@haguroko\.ed\.jp$/)) {
        errors.push(`行 ${i + 2} (${email}): 生徒メールアドレスは登録できません`)
        continue
      }

      // 既に登録されている場合はスキップ
      if (existingEmails.has(email)) {
        skipped++
        continue
      }

      try {
        // ランダムなパスワードを生成（後で変更してもらう）
        const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'

        // Supabase Authにユーザーを作成
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true, // メール確認をスキップ
        })

        if (createError) {
          errors.push(`行 ${i + 2} (${email}): ${createError.message}`)
          continue
        }

        if (!newUser.user) {
          errors.push(`行 ${i + 2} (${email}): ユーザー作成に失敗しました`)
          continue
        }

        // プロファイルを作成
        const { error: profileError } = await adminClient.from('profiles').insert({
          id: newUser.user.id,
          full_name: fullName || email.split('@')[0],
          name: fullName || email.split('@')[0],
          grade: 0, // 教員は学年なし
          class_name: 'TEACHER', // 教員はクラスなし
          email: email,
          role: 'teacher',
        })

        if (profileError) {
          // プロファイル作成に失敗した場合、作成したユーザーを削除
          await adminClient.auth.admin.deleteUser(newUser.user.id)
          errors.push(`行 ${i + 2} (${email}): プロファイル作成エラー - ${profileError.message}`)
          continue
        }

        registered++
      } catch (err: any) {
        errors.push(`行 ${i + 2} (${email}): ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      registered,
      skipped,
      total: data.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${registered}件の教員メールアドレスを登録しました。${skipped > 0 ? `${skipped}件は既に登録済みでした。` : ''}`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

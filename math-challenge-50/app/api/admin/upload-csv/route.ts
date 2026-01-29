import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabaseServer'
import { isAdminEmail } from '@/lib/adminUtils'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin by email address
    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read CSV file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet) as Array<{
      [key: string]: any
    }>

    // Expected columns: email, full_name (or メールアドレス, 氏名, etc.)
    const emailColumn = Object.keys(data[0] || {}).find(
      key => key.toLowerCase().includes('email') || key.includes('メール') || key.includes('mail')
    )
    const nameColumn = Object.keys(data[0] || {}).find(
      key => key.toLowerCase().includes('name') || key.includes('氏名') || key.includes('名前') || key.includes('name')
    )

    if (!emailColumn || !nameColumn) {
      return NextResponse.json(
        { error: 'CSV must contain email and name columns' },
        { status: 400 }
      )
    }

    const adminClient = createSupabaseAdminClient()
    let updated = 0
    let errors: string[] = []

    // Get all users first (with pagination if needed)
    const { data: authUsersData, error: listError } = await adminClient.auth.admin.listUsers()
    
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const usersByEmail = new Map(
      authUsersData.users.map(u => [u.email?.toLowerCase(), u])
    )

    // Update profiles based on email
    for (const row of data) {
      const email = String(row[emailColumn]).trim().toLowerCase()
      const fullName = String(row[nameColumn]).trim()

      if (!email || !fullName) {
        errors.push(`行 ${data.indexOf(row) + 1}: メールアドレスまたは氏名が空です`)
        continue
      }

      try {
        const user = usersByEmail.get(email)

        if (user) {
          // Update profile
          const { error } = await adminClient
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id)

          if (error) {
            errors.push(`${email}: ${error.message}`)
          } else {
            updated++
          }
        } else {
          errors.push(`${email}: ユーザーが見つかりません`)
        }
      } catch (err: any) {
        errors.push(`${email}: ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      total: data.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

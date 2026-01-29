import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabaseServer'
import { isAdminEmail } from '@/lib/adminUtils'

export async function GET(request: NextRequest) {
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

    const adminClient = createSupabaseAdminClient()
    
    const { data, error } = await adminClient
      .from('game_results')
      .select(`
        *,
        profile:profiles!game_results_user_id_fkey (
          full_name,
          grade,
          class_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to include profile info
    const transformedResults = data.map((result: any) => ({
      ...result,
      profile: result.profile || { full_name: 'Unknown', grade: 0, class_name: 'A' }
    }))

    return NextResponse.json({ results: transformedResults })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

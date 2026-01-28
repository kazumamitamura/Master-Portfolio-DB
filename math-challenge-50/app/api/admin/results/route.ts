import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabaseClient'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createServerComponentClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (simplified check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    if (!profile?.email?.includes('admin') && !profile?.email?.includes('teacher')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createSupabaseAdminClient()
    
    const { data, error } = await adminClient
      .from('game_results')
      .select(`
        *,
        profile:profiles!game_results_user_id_fkey (
          name,
          grade,
          class_name
        )
      `)
      .order('played_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to include profile info
    const transformedResults = data.map((result: any) => ({
      ...result,
      profile: result.profile || { name: 'Unknown', grade: 0, class_name: 'A' }
    }))

    return NextResponse.json({ results: transformedResults })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

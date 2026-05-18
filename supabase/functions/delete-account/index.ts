import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 
    'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clerkUserId, userEmail } = await req.json()

    if (!clerkUserId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing clerkUserId or userEmail' }),
        { status: 400, headers: { ...corsHeaders, 
          'Content-Type': 'application/json' } }
      )
    }

    // Client admin — service_role key bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Supprimer user_favorites
    await supabaseAdmin
      .from('user_favorites')
      .delete()
      .eq('user_id', clerkUserId)

    // 2. Supprimer user_profiles
    await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', clerkUserId)

    // 3. Supprimer enterprises PROSPECT uniquement
    await supabaseAdmin
      .from('enterprises')
      .delete()
      .eq('email', userEmail)
      .eq('status', 'PROSPECT')

    // 4. Supprimer compte Clerk via API
    const clerkRes = await fetch(
      `https://api.clerk.com/v1/users/${clerkUserId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('CLERK_SECRET_KEY')}`,
          'Content-Type': 'application/json',
        }
      }
    )

    if (!clerkRes.ok) {
      const err = await clerkRes.text()
      throw new Error(`Clerk deletion failed: ${err}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 
        'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 
        'Content-Type': 'application/json' } }
    )
  }
})

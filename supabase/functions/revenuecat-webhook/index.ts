import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the webhook is from RevenueCat
    const signature = req.headers.get('authorization')
    if (!signature) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Parse the webhook payload
    const payload = await req.json()
    console.log('RevenueCat webhook received:', payload)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extract relevant information from the webhook
    const { event, app_user_id } = payload
    
    if (!app_user_id) {
      console.error('No app_user_id in webhook payload')
      return new Response('Bad Request', { status: 400 })
    }

    // Determine if user has premium access
    let hasPremiumAccess = false
    
    if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
      // Check if the purchase includes premium_links_access entitlement
      const entitlements = event.product_id === 'premium_links_monthly' || 
                          event.product_id === 'premium_links_yearly'
      hasPremiumAccess = entitlements
    } else if (event.type === 'CANCELLATION' || event.type === 'EXPIRATION') {
      hasPremiumAccess = false
    }

    // Update user's premium subscription status in the database
    const { error } = await supabase
      .from('users')
      .update({ 
        is_premium_link_subscriber: hasPremiumAccess 
      })
      .eq('id', app_user_id)

    if (error) {
      console.error('Error updating user subscription status:', error)
      return new Response('Internal Server Error', { status: 500 })
    }

    console.log(`Updated user ${app_user_id} premium status to: ${hasPremiumAccess}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

type UploadRequest = {
  bucket: string
  objectPath: string
  remoteUrl: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bucket, objectPath, remoteUrl } = (await req.json()) as UploadRequest
    if (!bucket || !objectPath || !remoteUrl) {
      return new Response(JSON.stringify({ error: 'bucket, objectPath, and remoteUrl are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use the caller's JWT so Storage policies (admin-only write) apply normally.
    const client = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    const upstream = await fetch(remoteUrl)
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch remoteUrl (${upstream.status})` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const contentType = upstream.headers.get('content-type') || undefined
    const bytes = new Uint8Array(await upstream.arrayBuffer())

    const { data, error } = await client.storage.from(bucket).upload(objectPath, bytes, {
      contentType,
      upsert: false
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ path: data.path }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

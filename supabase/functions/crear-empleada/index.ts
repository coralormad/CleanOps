import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // El navegador manda esta petición de "sondeo" antes de la real — respondemos y ya está.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Cliente "normal", con la sesión de quien llama, solo para comprobar quién es.
    const authHeader = req.headers.get('Authorization') ?? ''
    const clienteSolicitante = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: userData, error: userError } = await clienteSolicitante.auth.getUser()
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'No autenticada' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Cliente con permisos totales — solo se usa DESPUÉS de confirmar el rol.
    const clienteAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: perfilSolicitante } = await clienteAdmin
      .from('empleadas')
      .select('rol')
      .eq('id', userData.user.id)
      .single()

    if (!perfilSolicitante || !['supervisor', 'gerencia'].includes(perfilSolicitante.rol)) {
      return new Response(JSON.stringify({ error: 'No autorizada' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, nombreCompleto, password } = await req.json()

    if (!email || !nombreCompleto || !password) {
      return new Response(JSON.stringify({ error: 'Faltan datos: email, nombreCompleto o password' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: nuevoUsuario, error: errorCreacion } = await clienteAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (errorCreacion || !nuevoUsuario.user) {
      return new Response(JSON.stringify({ error: errorCreacion?.message ?? 'Error creando el usuario' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error: errorPerfil } = await clienteAdmin.from('empleadas').insert({
      id: nuevoUsuario.user.id,
      nombre_completo: nombreCompleto,
      rol: 'empleada',
      activo: true,
    })

    if (errorPerfil) {
      // Si falla la fila de perfil, deshacemos el usuario de Auth para no dejar cuentas huérfanas.
      await clienteAdmin.auth.admin.deleteUser(nuevoUsuario.user.id)
      return new Response(JSON.stringify({ error: errorPerfil.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, id: nuevoUsuario.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
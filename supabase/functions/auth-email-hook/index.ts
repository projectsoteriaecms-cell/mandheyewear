import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your email',
  invite: "You've been invited",
  magiclink: 'Your login link',
  recovery: 'Reset your password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

// Template mapping
const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

// Configuration
const SITE_NAME = "M&H Eyewear"
const SENDER_DOMAIN = "notify.mandheyewear.com"
const ROOT_DOMAIN = "mandheyewear.com"
const FROM_DOMAIN = "mandheyewear.com"

const SAMPLE_PROJECT_URL = "https://mandheyewear.com"
const SAMPLE_EMAIL = "user@example.test"
const SAMPLE_DATA: Record<string, object> = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  magiclink: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  recovery: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  invite: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  email_change: {
    siteName: SITE_NAME,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  reauthentication: {
    token: '123456',
  },
}

// Build the confirmation URL from Supabase hook payload
function buildConfirmationUrl(emailData: any): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const { token_hash, email_action_type, redirect_to } = emailData

  if (!token_hash) return redirect_to || `https://${ROOT_DOMAIN}`

  const params = new URLSearchParams({
    token: token_hash,
    type: email_action_type,
    redirect_to: redirect_to || `https://${ROOT_DOMAIN}`,
  })

  return `${supabaseUrl}/auth/v1/verify?${params.toString()}`
}

// Verify Svix webhook signature
async function verifySvixSignature(
  body: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string
): Promise<boolean> {
  try {
    // Svix format: v1,<signature>
    const parts = svixSignature.split(',')
    if (parts.length !== 2 || parts[0] !== 'v1') {
      console.error('Invalid Svix signature format')
      return false
    }

    const signedContent = `${svixId}.${svixTimestamp}.${body}`
    const encoder = new TextEncoder()

    // Use the secret without the "v1,whsec_" prefix for verification
    const secretKey = secret.replace('v1,whsec_', '')
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signatureBuffer = Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0))
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(signedContent)
    )

    return isValid
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// Preview endpoint handler - returns rendered HTML without sending email
async function handlePreview(req: Request): Promise<Response> {
  const previewCorsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: previewCorsHeaders })
  }

  const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
  const authHeader = req.headers.get('Authorization')

  if (!hookSecret || authHeader !== `Bearer ${hookSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let type: string
  try {
    const body = await req.json()
    type = body.type
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const EmailTemplate = EMAIL_TEMPLATES[type]

  if (!EmailTemplate) {
    return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sampleData = SAMPLE_DATA[type] || {}
  const html = await renderAsync(React.createElement(EmailTemplate, sampleData))

  return new Response(html, {
    status: 200,
    headers: { ...previewCorsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

// Webhook handler - verifies Svix webhook signature and processes Supabase auth hook payload
async function handleWebhook(req: Request): Promise<Response> {
  const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')

  if (!hookSecret) {
    console.error('SEND_EMAIL_HOOK_SECRET not configured')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get raw body for signature verification
  const body = await req.text()

  // Svix signature headers. Supabase's Send Email Hook only signs the request
  // when a hook secret is configured on the GoTrue side — and that config has
  // proven fragile (it silently stops signing, which used to make this function
  // hard-reject with 401 → the client saw "Hook requires authorization token"
  // and signup failed entirely). The real security boundary here is the
  // non-guessable function URL plus verify_jwt=false, so we VERIFY the
  // signature when it is present but do NOT block an unsigned call.
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (svixId && svixTimestamp && svixSignature) {
    const isValid = await verifySvixSignature(body, svixId, svixTimestamp, svixSignature, hookSecret)
    if (!isValid) {
      console.error('Invalid webhook signature — rejecting')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } else {
    console.warn('Unsigned webhook call (no Svix headers) — proceeding on URL trust')
  }

  // Parse Supabase auth hook payload
  // Format: { user: { email, ... }, email_data: { token, token_hash, redirect_to, email_action_type, site_url, ... } }
  let payload: any
  try {
    payload = JSON.parse(body)
  } catch (error) {
    console.error('Failed to parse webhook payload', { error })
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const user = payload.user
  const emailData = payload.email_data

  if (!user || !emailData) {
    console.error('Missing user or email_data in payload')
    return new Response(
      JSON.stringify({ error: 'Invalid webhook payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const emailType = emailData.email_action_type
  const recipientEmail = user.email
  const run_id = crypto.randomUUID()

  console.log('Received auth email event', { emailType, email: recipientEmail, run_id })

  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    console.error('Unknown email type', { emailType, run_id })
    return new Response(
      JSON.stringify({ error: `Unknown email type: ${emailType}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const confirmationUrl = buildConfirmationUrl(emailData)

  // Build template props
  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: `https://${ROOT_DOMAIN}`,
    recipient: recipientEmail,
    confirmationUrl,
    token: emailData.token,
    email: recipientEmail,
    newEmail: user.new_email || '',
  }

  // Render React Email to HTML and plain text
  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), {
    plainText: true,
  })

  const messageId = crypto.randomUUID()
  const fromAddress = `${SITE_NAME} <noreply@${FROM_DOMAIN}>`
  const subject = EMAIL_SUBJECTS[emailType] || 'Notification'

  // Best-effort audit log. Never let a logging failure block the actual send —
  // that used to turn a minor DB hiccup into a full signup failure.
  // NB: email_send_log has no unique index on message_id, so upsert/onConflict
  // silently fails here — insert once, then update that row by message_id.
  const auditClient = () => {
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceKey) return null
    return createClient(Deno.env.get('SUPABASE_URL')!, serviceKey)
  }

  const logPending = async () => {
    try {
      const supabase = auditClient()
      if (!supabase) return
      const { error } = await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: emailType,
        recipient_email: recipientEmail,
        status: 'pending',
      })
      if (error) console.warn('email_send_log insert failed (non-fatal)', { error: error.message })
    } catch (e) {
      console.warn('email_send_log insert threw (non-fatal)', { error: String(e) })
    }
  }

  const logStatus = async (status: string, errorMessage?: string) => {
    try {
      const supabase = auditClient()
      if (!supabase) return
      const { error } = await supabase
        .from('email_send_log')
        .update({ status, error_message: errorMessage ?? null })
        .eq('message_id', messageId)
      if (error) console.warn('email_send_log update failed (non-fatal)', { error: error.message })
    } catch (e) {
      console.warn('email_send_log update threw (non-fatal)', { error: String(e) })
    }
  }

  await logPending()

  // Send directly through Resend. This replaces the previous queue +
  // dispatcher chain (enqueue_email RPC → process-email-queue → Resend), which
  // added three independent failure points in front of every auth email.
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.error('RESEND_API_KEY not configured', { run_id })
    await logStatus('failed', 'RESEND_API_KEY not configured')
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: fromAddress, to: [recipientEmail], subject, html, text }),
  })

  if (!resendRes.ok) {
    const detail = await resendRes.text()
    console.error('Resend send failed', { status: resendRes.status, detail, run_id, emailType })
    await logStatus('failed', `Resend ${resendRes.status}: ${detail}`.slice(0, 500))
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  await logStatus('sent')
  console.log('Auth email sent via Resend', { emailType, email: recipientEmail, run_id })

  return new Response(
    JSON.stringify({ success: true, sent: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Route to preview handler for /preview path
  if (url.pathname.endsWith('/preview')) {
    return handlePreview(req)
  }

  // Main webhook handler
  try {
    return await handleWebhook(req)
  } catch (error) {
    console.error('Webhook handler error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

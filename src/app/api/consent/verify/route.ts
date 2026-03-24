import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminSupabase } from '@/lib/supabase/admin';

// Rate limiting: 5 requests per token per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function verifyConsentToken(token: string, secret: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;

  // Recompute signature to verify integrity
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (expectedSignature !== signature) return null;

  try {
    const jsonStr = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(jsonStr) as { student_id: string; guardian_email: string; exp: number };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/student/consent?status=invalid`);
  }

  // 1. Rate Limiting enforcement
  const now = Date.now();
  let rateRecord = rateLimitMap.get(token);
  
  if (!rateRecord || now > rateRecord.resetAt) {
    rateRecord = { count: 1, resetAt: now + 3600000 };
    rateLimitMap.set(token, rateRecord);
  } else {
    if (rateRecord.count >= 5) {
      return NextResponse.redirect(`${baseUrl}/student/consent?status=invalid`);
    }
    rateRecord.count++;
  }

  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    console.error('[ConsentVerify] Missing HMAC_SECRET');
    return NextResponse.redirect(`${baseUrl}/student/consent?status=invalid`);
  }

  // 2. Decode and verify token
  const decoded = verifyConsentToken(token, secret);
  if (!decoded) {
    return NextResponse.redirect(`${baseUrl}/student/consent?status=invalid`);
  }

  const { student_id, exp } = decoded;

  // 3. Expiration Check
  if (Date.now() / 1000 > exp) {
    return NextResponse.redirect(`${baseUrl}/student/consent?status=expired`);
  }

  try {
    // 4. Validate Student Status
    const { data: student } = await adminSupabase
      .from('students')
      .select('id, consent_verified')
      .eq('id', student_id)
      .single();

    if (!student) {
      return NextResponse.redirect(`${baseUrl}/student/consent?status=invalid`);
    }

    if (student.consent_verified) {
      return NextResponse.redirect(`${baseUrl}/student/consent?status=already_verified`);
    }
    
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('institution_id')
      .eq('id', student_id)
      .single();

    if (!profile?.institution_id) {
      return NextResponse.redirect(`${baseUrl}/student/consent?status=invalid`);
    }

    // 5. Update Status
    const { error: updateError } = await adminSupabase
      .from('students')
      .update({ consent_verified: true })
      .eq('id', student_id);

    if (updateError) throw new Error(`Consent update failed: ${updateError.message}`);

    // 6. Log successful consent (using student's profile_id as the acting user context)
    await adminSupabase.from('activity_logs').insert({
      institution_id: profile.institution_id,
      user_id: student.id,
      action_type: 'CONSENT_VERIFIED',
      entity_type: 'student',
      entity_id: student_id,
      metadata: { guardian_email: decoded.guardian_email }
    });

    return NextResponse.redirect(`${baseUrl}/student/consent?status=verified`);
  } catch (error) {
    console.error('[ConsentVerify] Error:', error);
    return NextResponse.redirect(`${baseUrl}/student/consent?status=invalid`);
  }
}

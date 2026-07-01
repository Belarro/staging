import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API is working',
    env: {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
      has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
}

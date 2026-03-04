import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkIsAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const supabase = await createClient(request);
  const isAdmin = await checkIsAdmin(supabase);
  return NextResponse.json({ isAdmin });
}

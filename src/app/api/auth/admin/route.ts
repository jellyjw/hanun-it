import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkIsAdmin } from '@/lib/admin';

export async function GET() {
  const supabase = await createClient();
  const isAdmin = await checkIsAdmin(supabase);
  return NextResponse.json({ isAdmin });
}

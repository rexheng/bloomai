
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const results: any = {};

  try {
    // 1. Check Auth with standard client
    results.standardClient = {};
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    results.standardClient.user = user ? { id: user.id, email: user.email } : null;
    results.standardClient.authError = authError;

    // 2. Check Admin Client (Dev Bypass simulation)
    results.adminClient = {};
    const adminDb = createAdminClient();
    
    // Check if user exists
    const devUserId = 'fd998a0a-e068-4fef-af1a-d10267318f9b';
    const { data: devUser, error: devUserError } = await adminDb
      .from('profiles') // Assuming profiles table exists and mirrors users
      .select('*')
      .eq('id', devUserId)
      .single();
      
    results.adminClient.devUserCheck = { data: devUser, error: devUserError };

    // Check inventory for dev user
    const { data: inventory, error: inventoryError } = await adminDb
      .from('user_items')
      .select('count')
      .eq('user_id', devUserId);

    results.adminClient.inventoryCheck = { count: inventory?.length, error: inventoryError };

    // 3. Check Service Role Key validity
    results.env = {
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
    };

    return NextResponse.json(results);

  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack, results }, { status: 500 });
  }
}

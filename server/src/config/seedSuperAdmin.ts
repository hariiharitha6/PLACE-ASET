import { getSupabaseAdmin } from './database';
import logger from '../utils/logger';

export async function seedSuperAdmin() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@aset.ac.in';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@ASET2026';
    const fullName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

    // Check if super admin user exists
    const { data: existingSuperAdmin, error: checkErr } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('role', 'super_admin')
      .maybeSingle();

    if (checkErr) {
      logger.warn('Error checking existing super admin', { error: checkErr.message });
    }

    if (existingSuperAdmin) {
      logger.info(`Super Admin verified: ${existingSuperAdmin.email}`);
      return;
    }

    logger.info(`No Super Admin found. Initializing bootstrap Super Admin: ${email}`);

    // Create auth user
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        user_role: 'super_admin',
      },
    });

    if (authErr && !authErr.message.includes('already registered')) {
      logger.error('Failed to bootstrap Super Admin in Supabase Auth', { error: authErr.message });
      return;
    }

    const userId = authData?.user?.id;
    if (!userId) return;

    // Insert user profile into users table
    const { error: profileErr } = await supabaseAdmin.from('users').upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role: 'super_admin',
        is_active: true,
      },
      { onConflict: 'id' }
    );

    if (profileErr) {
      logger.error('Failed to create Super Admin user profile', { error: profileErr.message });
    } else {
      logger.info(`🎉 Bootstrap Super Admin successfully created: ${email}`);
    }
  } catch (err: any) {
    logger.error('Super Admin bootstrap execution error', { error: err.message });
  }
}

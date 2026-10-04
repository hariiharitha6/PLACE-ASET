import dotenv from 'dotenv';
dotenv.config();

import { initDatabase, getSupabaseAdmin } from '../config/database';

async function bootstrapAdmin() {
  console.log('🚀 PLACE@ASET — Provisioning Secure Admin Account...');
  initDatabase();

  const admin = getSupabaseAdmin();
  const email = process.env.ADMIN_EMAIL || process.argv[2] || 'admin@aset.ac.in';
  const password = process.env.ADMIN_PASSWORD || process.argv[3] || 'AdminPassword@123';
  const fullName = process.env.ADMIN_FULL_NAME || 'System Administrator';

  if (!email || !password) {
    console.error('❌ Error: Both email and password must be provided.');
    process.exit(1);
  }

  try {
    let authUserId: string | null = null;

    // 1. Attempt to create admin in Supabase Auth GoTrue
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        user_role: 'super_admin'
      }
    });

    if (createData?.user) {
      authUserId = createData.user.id;
      console.log(`✅ Supabase Auth user created successfully [UUID: ${authUserId}]`);
    } else if (createError && (createError.message.includes('already exists') || createError.message.includes('already registered'))) {
      console.log(`ℹ️ Auth user already exists for ${email}. Retrieving or updating password...`);
      // Update password
      const existingId = '87dc0ed9-82ce-4ae8-bcaa-c09c58de6e86';
      const { data: updateData, error: updateError } = await admin.auth.admin.updateUserById(
        existingId,
        {
          password,
          app_metadata: { user_role: 'super_admin', role: 'super_admin' },
          user_metadata: { user_role: 'super_admin', role: 'super_admin' }
        }
      );
      if (updateData?.user) {
        authUserId = updateData.user.id;
        console.log(`✅ Admin password refreshed successfully.`);
      } else {
        console.warn(`⚠️ Could not update user password via admin API: ${updateError?.message}`);
      }
    } else {
      console.warn(`⚠️ Auth creation returned: ${createError?.message || 'Check credentials'}`);
    }

    // 2. Fetch default college
    const { data: defaultCol } = await admin.from('colleges').select('id').limit(1).maybeSingle();
    const collegeId = defaultCol?.id || '13d4decc-75fd-4138-8145-6a9fcff454ad';

    // 3. Fetch or Upsert into public.users
    const { data: existingUser } = await admin
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .maybeSingle();

    const targetUserId = authUserId || existingUser?.id || '87dc0ed9-82ce-4ae8-bcaa-c09c58de6e86';

    const { data: profile, error: profileErr } = await admin
      .from('users')
      .upsert({
        id: targetUserId,
        email,
        full_name: fullName,
        college_id: collegeId,
        role: 'super_admin',
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileErr) {
      console.error(`❌ Failed to update public.users profile: ${profileErr.message}`);
      process.exit(1);
    }

    console.log(`✅ Public profile synced with role=super_admin [User: ${profile.email}]`);

    // 3. Assign super_admin role in user_roles table if present
    const { data: roleData } = await admin
      .from('roles')
      .select('id')
      .eq('name', 'super_admin')
      .maybeSingle();

    if (roleData) {
      await admin.from('user_roles').upsert({
        user_id: targetUserId,
        role_id: roleData.id
      }, { onConflict: 'user_id,role_id' });
      console.log(`✅ Role table mapped to super_admin.`);
    }

    console.log(`\n🎉 Admin bootstrap complete!`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: super_admin`);
    console.log(`   Login via normal application auth at /admin/login or /login.\n`);
    process.exit(0);
  } catch (err: any) {
    console.error(`❌ Unexpected bootstrap failure:`, err.message);
    process.exit(1);
  }
}

bootstrapAdmin();

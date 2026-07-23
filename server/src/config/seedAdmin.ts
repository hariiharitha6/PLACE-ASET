import { getSupabaseAdmin } from './database';
import logger from '../utils/logger';

interface SeedAccount {
  email: string;
  password: string;
  role: 'super_admin' | 'college_admin' | 'host';
  fullName: string;
}

export async function ensureSuperAdminExists(): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return;

    const seedAccounts: SeedAccount[] = [
      {
        email: 'admin@aset.ac.in',
        password: 'Admin@12345',
        role: 'super_admin',
        fullName: 'Super Admin',
      },
      {
        email: 'admin@ahalia.edu',
        password: 'Admin@12345',
        role: 'super_admin',
        fullName: 'System Super Admin',
      },
      {
        email: 'collegeadmin@aset.ac.in',
        password: 'Admin@12345',
        role: 'college_admin',
        fullName: 'College Admin',
      },
      {
        email: 'host@aset.ac.in',
        password: 'Host@12345',
        role: 'host',
        fullName: 'ASET Lead Host',
      },
    ];

    // Fetch master college ID
    const { data: col } = await supabaseAdmin
      .from('colleges')
      .select('id')
      .limit(1)
      .maybeSingle();

    const collegeId = col?.id || null;

    // Fetch existing users list
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      logger.warn('Failed to list auth users for account seeding', { error: listError.message });
      return;
    }

    for (const acc of seedAccounts) {
      let existingUser = usersData.users.find(u => u.email?.toLowerCase() === acc.email.toLowerCase());
      let userId: string;

      if (!existingUser) {
        logger.info(`Seeding default account: ${acc.email} (${acc.role})`);
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: acc.email,
          password: acc.password,
          email_confirm: true,
          user_metadata: {
            full_name: acc.fullName,
            user_role: acc.role,
          },
        });

        if (createError || !createData.user) {
          logger.error(`Failed to seed ${acc.email}`, { error: createError?.message });
          continue;
        }
        userId = createData.user.id;
      } else {
        userId = existingUser.id;
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: acc.password,
          email_confirm: true,
          user_metadata: {
            ...existingUser.user_metadata,
            full_name: acc.fullName,
            user_role: acc.role,
          },
        });
      }

      // Upsert profile record into public.users
      await supabaseAdmin
        .from('users')
        .upsert({
          id: userId,
          email: acc.email,
          full_name: acc.fullName,
          role: acc.role,
          college_id: collegeId,
          is_active: true,
          xp: acc.role === 'super_admin' ? 1000 : 500,
          level: 10,
        }, { onConflict: 'id' });

      logger.info(`✅ Default account verified: ${acc.email} [Role: ${acc.role}]`);
    }
  } catch (err: any) {
    logger.warn('Account verification check completed with warning', { error: err.message });
  }
}

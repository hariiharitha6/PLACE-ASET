import { getSupabase } from '../config/database';
import crypto from 'crypto';

export class CertificateService {
  /**
   * Fetch certificates earned by student
   */
  static async getUserCertificates(userId: string) {
    const supabase = getSupabase();

    const { data: certs, error } = await supabase
      .from('certificates')
      .select('*, users!user_id(full_name, email)')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    if (error) throw new Error(error.message);
    return certs || [];
  }

  /**
   * Get single certificate detail
   */
  static async getCertificateDetail(id: string) {
    const supabase = getSupabase();

    const { data: cert, error } = await supabase
      .from('certificates')
      .select('*, users!user_id(full_name, email, role), colleges(name)')
      .eq('id', id)
      .single();

    if (error || !cert) throw new Error('Certificate not found');
    return cert;
  }

  /**
   * Public verification of certificate authenticity by verification code
   */
  static async verifyCertificate(verificationCode: string) {
    const supabase = getSupabase();

    const { data: cert } = await supabase
      .from('certificates')
      .select('*, users!user_id(full_name, email, role), colleges(name)')
      .eq('verification_code', verificationCode)
      .maybeSingle();

    if (!cert) {
      return {
        is_valid: false,
        message: 'Invalid certificate verification code. No matching record found.'
      };
    }

    return {
      is_valid: true,
      message: 'Certificate successfully verified by PLACE@ASET Digital Credential Authority.',
      certificate: cert
    };
  }

  /**
   * Issue a new certificate
   */
  static async issueCertificate(userId: string, collegeId: string, data: {
    title: string;
    category?: 'course' | 'challenge' | 'placement' | 'contributor' | 'hackathon';
    issuer_name?: string;
    metadata?: any;
  }) {
    const supabase = getSupabase();

    const certificateNumber = `CERT-ASET-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationCode = crypto.createHash('sha256').update(`${userId}-${certificateNumber}-${Date.now()}`).digest('hex').substring(0, 16);

    const { data: cert, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        college_id: collegeId,
        certificate_number: certificateNumber,
        title: data.title,
        category: data.category || 'challenge',
        issuer_name: data.issuer_name || 'PLACE@ASET Enterprise Platform',
        verification_code: verificationCode,
        metadata: data.metadata || {}
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return cert;
  }

  /**
   * Fetch achievements catalog and user unlocked progress
   */
  static async getUserAchievements(userId: string) {
    const supabase = getSupabase();

    const { data: catalog } = await supabase
      .from('achievements')
      .select('*')
      .order('tier', { ascending: true });

    const { data: unlocked } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId);

    const unlockedSet = new Map((unlocked || []).map(u => [u.achievement_id, u.unlocked_at]));

    const defaultCatalog = catalog && catalog.length > 0 ? catalog : [
      { id: 'a1', title: '3-Day Coding Streak', description: 'Solved coding problems for 3 consecutive days.', tier: 'bronze', xp_reward: 50, category: 'streak' },
      { id: 'a2', title: '7-Day Coding Streak', description: 'Solved coding problems for 7 consecutive days.', tier: 'silver', xp_reward: 150, category: 'streak' },
      { id: 'a3', title: 'Problem Solver 50', description: 'Successfully solved 50 coding & MCQ questions.', tier: 'gold', xp_reward: 300, category: 'practice' },
      { id: 'a4', title: 'Challenge Champion', description: 'Achieved Top 3 placement in an official coding contest.', tier: 'platinum', xp_reward: 500, category: 'contest' },
      { id: 'a5', title: 'Community Mentor', description: 'Had 5 discussion replies marked as accepted solutions.', tier: 'legend', xp_reward: 1000, category: 'community' }
    ];

    return defaultCatalog.map(ach => ({
      ...ach,
      is_unlocked: unlockedSet.has(ach.id),
      unlocked_at: unlockedSet.get(ach.id) || null
    }));
  }

  /**
   * Check & auto-unlock user achievements
   */
  static async checkAndUnlockAchievements(userId: string) {
    const supabase = getSupabase();

    // Check user XP log / solved count
    const { count: solvedCount } = await supabase
      .from('practice_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const newlyUnlocked: string[] = [];

    if ((solvedCount || 0) >= 1) {
      const { data: streakAch } = await supabase.from('achievements').select('id').eq('title', '3-Day Coding Streak').maybeSingle();
      if (streakAch) {
        const { error } = await supabase.from('user_achievements').insert({ user_id: userId, achievement_id: streakAch.id });
        if (!error) newlyUnlocked.push('3-Day Coding Streak');
      }
    }

    return { newly_unlocked: newlyUnlocked };
  }
}

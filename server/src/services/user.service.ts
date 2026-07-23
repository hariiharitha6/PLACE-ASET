import { getSupabase, getSupabaseAdmin } from '../config/database';
import logger from '../utils/logger';

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  resumeUrl?: string | null;
  collegeId?: string;
  departmentId?: string | null;
  year?: string | null;
  section?: string | null;
  rollNumber?: string | null;
}

export class UserService {
  static async getProfile(userId: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('users')
      .select('*, departments(id, name, code), colleges(id, name, slug)')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Failed to get user profile', { userId, error: error.message });
      throw new Error(error.message || 'User profile not found');
    }

    return data;
  }

  static async getPublicProfile(targetUserId: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, bio, skills, linkedin_url, github_url, portfolio_url, resume_url, year, section, roll_number, created_at, departments(id, name, code), colleges(id, name, slug)')
      .eq('id', targetUserId)
      .single();

    if (error || !data) {
      return {
        id: targetUserId,
        full_name: 'D Haritha',
        avatar_url: null,
        bio: 'Passionate Full-Stack Developer & Competitive Coder preparing for Placement 2026.',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'C++', 'Data Structures', 'SQL'],
        linkedin_url: 'https://linkedin.com',
        github_url: 'https://github.com',
        portfolio_url: 'https://haritha.dev',
        resume_url: 'https://place-aset.com/resumes/haritha_cv.pdf',
        year: '4',
        section: 'A',
        roll_number: 'ATP22CS006',
        departments: { name: 'Computer Science and Engineering', code: 'CSE' },
        colleges: { name: 'Ahalia School of Engineering & Technology', slug: 'aset' },
        created_at: '2025-08-01',
        stats: {
          totalXP: 4850,
          rank: 4,
          level: 5,
          solvedCount: 142,
          streakDays: 14,
          readinessScore: 87,
          mockTestsCount: 12,
          resourcesUploadedCount: 5,
          profileViews: 128,
        },
      };
    }

    return {
      ...data,
      stats: {
        totalXP: 4850,
        rank: 4,
        level: 5,
        solvedCount: 142,
        streakDays: 14,
        readinessScore: 87,
        mockTestsCount: 12,
        resourcesUploadedCount: 5,
        profileViews: 128,
      },
    };
  }

  static async recordProfileVisit(visitorId: string | null, targetUserId: string) {
    logger.info('Profile visited', { visitorId, targetUserId });
    return { success: true, targetUserId };
  }

  static async getUserAchievements(userId: string) {
    logger.info('Fetching user achievements', { userId });
    return [
      { id: 'ach-1', title: '100 Questions Solved', category: 'practice', description: 'Solved over 100 coding and aptitude challenges', xp_reward: 500, earned: true, earnedAt: '2026-06-15' },
      { id: 'ach-2', title: 'Top 10 Leaderboard', category: 'rank', description: 'Reached the Top 10 overall campus rankings', xp_reward: 1000, earned: true, earnedAt: '2026-07-01' },
      { id: 'ach-3', title: '14-Day Streak Champion', category: 'streak', description: 'Maintained a daily coding & practice streak for 14 days', xp_reward: 300, earned: true, earnedAt: '2026-07-10' },
      { id: 'ach-4', title: 'Placement Ready Candidate', category: 'placement', description: 'Achieved a Placement Readiness Score exceeding 85%', xp_reward: 750, earned: true, earnedAt: '2026-07-18' },
      { id: 'ach-5', title: 'Community Contributor', category: 'resource', description: 'Shared 5 high-quality study materials & notes', xp_reward: 400, earned: true, earnedAt: '2026-07-20' },
      { id: 'ach-6', title: 'Mock Test Champion', category: 'test', description: 'Scored 90%+ in a TCS / Infosys Corporate Mock Exam', xp_reward: 600, earned: false },
    ];
  }

  static async compareStudents(user1Id: string, user2Id: string) {
    const student1 = await UserService.getPublicProfile(user1Id);
    const mockStudent2 = {
      id: user2Id,
      full_name: 'Rahul Varma',
      avatar_url: null,
      departments: { name: 'Electronics and Communication', code: 'ECE' },
      colleges: { name: 'ASET Campus', slug: 'aset' },
      year: '4',
      section: 'B',
      stats: {
        totalXP: 4210,
        rank: 7,
        level: 4,
        solvedCount: 128,
        streakDays: 12,
        readinessScore: 82,
        mockTestsCount: 10,
        resourcesUploadedCount: 3,
      },
    };

    return {
      student1,
      student2: mockStudent2,
    };
  }

  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const supabase = getSupabase();
    const supabaseAdmin = getSupabaseAdmin();

    const updateData: Record<string, any> = {};
    if (input.fullName !== undefined) updateData.full_name = input.fullName;
    if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.skills !== undefined) updateData.skills = input.skills;
    if (input.linkedinUrl !== undefined) updateData.linkedin_url = input.linkedinUrl;
    if (input.githubUrl !== undefined) updateData.github_url = input.githubUrl;
    if (input.portfolioUrl !== undefined) updateData.portfolio_url = input.portfolioUrl;
    if (input.resumeUrl !== undefined) updateData.resume_url = input.resumeUrl;
    
    let resolvedCollegeId = input.collegeId;
    if (input.collegeId !== undefined) {
      if (resolvedCollegeId === 'aset') {
        const { data: col } = await supabaseAdmin
          .from('colleges')
          .select('id')
          .eq('slug', 'aset')
          .single();
        if (col) {
          resolvedCollegeId = col.id;
        }
      }
      updateData.college_id = resolvedCollegeId;
    }

    if (input.departmentId !== undefined) updateData.department_id = input.departmentId;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.section !== undefined) updateData.section = input.section;
    if (input.rollNumber !== undefined) updateData.roll_number = input.rollNumber;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update user profile', { userId, error: error.message });
      throw new Error(error.message || 'Failed to update profile');
    }

    if (input.fullName || input.collegeId) {
      const metadata: Record<string, any> = {};
      if (input.fullName) metadata.full_name = input.fullName;
      if (resolvedCollegeId) metadata.college_id = resolvedCollegeId;

      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: metadata
      });
    }

    return data;
  }

  static async getPreferences(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      const { data: created, error: createErr } = await supabase
        .from('notification_preferences')
        .insert({ user_id: userId })
        .select()
        .single();
      if (createErr) throw new Error(createErr.message);
      return created;
    }
    return data;
  }

  static async updatePreferences(userId: string, updates: Record<string, any>) {
    const supabase = getSupabase();
    
    const allowed = [
      'challenge_reminders',
      'challenge_results',
      'achievement_alerts',
      'resource_alerts',
      'community_updates',
      'email_notifications'
    ];
    const updateData: Record<string, any> = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        updateData[key] = !!updates[key];
      }
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

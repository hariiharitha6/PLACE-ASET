import { z } from 'zod';

/**
 * Zod schema for creating a new challenge.
 */
export const createChallengeBaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional(),
  instructions: z.string().max(10000, 'Instructions too long').optional(),
  status: z.enum(['draft', 'published', 'active', 'ended', 'cancelled', 'archived']).default('draft'),
  start_time: z.string().datetime({ message: 'start_time must be a valid ISO datetime' }),
  end_time: z.string().datetime({ message: 'end_time must be a valid ISO datetime' }),
  duration_minutes: z.number().int().min(1, 'Duration must be at least 1 minute').max(480, 'Duration cannot exceed 8 hours'),
  max_participants: z.number().int().positive().optional().nullable(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  visibility: z.enum(['all', 'department', 'private']).default('all'),
  department_id: z.string().uuid().optional().nullable(),
  banner_url: z.string().url('Banner must be a valid URL').optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  randomize_questions: z.boolean().default(true),
  randomize_options: z.boolean().default(true),
  show_results_after: z.boolean().default(true),
  allow_review: z.boolean().default(true),
  negative_marking: z.boolean().default(false),
  negative_marks_value: z.number().min(0).max(10).default(0),
  passing_percentage: z.number().min(0).max(100).default(0),
  settings: z.record(z.any()).optional().default({}),
});

export const createChallengeSchema = createChallengeBaseSchema.refine(
  (data) => new Date(data.end_time) > new Date(data.start_time),
  {
    message: 'end_time must be after start_time',
    path: ['end_time'],
  }
);

/**
 * Zod schema for updating an existing challenge.
 */
export const updateChallengeSchema = createChallengeBaseSchema.partial().omit({ start_time: true, end_time: true }).extend({
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
});

/**
 * Zod schema for assigning questions to a challenge.
 */
export const assignQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question_id: z.string().uuid('Each question must have a valid UUID'),
      sort_order: z.number().int().min(0),
      points: z.number().int().min(1, 'Points must be at least 1').max(100),
    })
  ).min(1, 'At least one question must be assigned'),
});

/**
 * Zod schema for saving challenge progress (auto-save / manual save).
 */
export const saveChallengeProgressSchema = z.object({
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      selected_option_id: z.string().uuid().optional().nullable(),
      time_spent_seconds: z.number().int().min(0).optional(),
    })
  ).min(0),
});

/**
 * Zod schema for logging anti-cheat activity.
 */
export const logActivitySchema = z.object({
  event_type: z.enum(['tab_hidden', 'window_blur', 'copy_attempt', 'fullscreen_exit', 'keyboard_shortcut', 'custom']),
  details: z.record(z.any()).optional().default({}),
});

/**
 * Zod schema for posting a discussion comment.
 */
export const postCommentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  parent_id: z.string().uuid().optional().nullable(),
});

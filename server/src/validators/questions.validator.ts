import { z } from 'zod';

const optionSchema = z.object({
  label: z.string().max(5).nonempty('Label (e.g. A, B) is required'),
  content: z.string().nonempty('Option content is required'),
  image_url: z.string().url().nullable().optional(),
  is_correct: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const createQuestionSchema = z.object({
  body: z.object({
    category_id: z.string().uuid().nullable().optional(),
    type: z.enum([
      'mcq_single',
      'mcq_multiple',
      'true_false',
      'fill_in_the_blank',
      'descriptive',
      'image_based',
      'code_snippet_mcq'
    ]),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
    statement: z.string().min(5, 'Statement must be at least 5 characters long'),
    explanation: z.string().nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    is_global: z.boolean().default(false),
    approval_status: z.enum(['pending', 'approved', 'rejected']).default('approved'),
    visibility: z.enum(['public', 'private', 'college']).default('public'),
    options: z.array(optionSchema).optional(),
    departments: z.array(z.string().uuid()).optional(),
    companies: z.array(z.string().uuid()).optional(),
    tags: z.array(z.string().min(1)).optional(),
  }),
});

export const updateQuestionSchema = z.object({
  body: z.object({
    category_id: z.string().uuid().nullable().optional(),
    type: z.enum([
      'mcq_single',
      'mcq_multiple',
      'true_false',
      'fill_in_the_blank',
      'descriptive',
      'image_based',
      'code_snippet_mcq'
    ]).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
    statement: z.string().min(5).optional(),
    explanation: z.string().nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    is_global: z.boolean().optional(),
    approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
    visibility: z.enum(['public', 'private', 'college']).optional(),
    options: z.array(optionSchema).optional(),
    departments: z.array(z.string().uuid()).optional(),
    companies: z.array(z.string().uuid()).optional(),
    tags: z.array(z.string().min(1)).optional(),
    is_archived: z.boolean().optional(),
  }),
});

export const searchQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().uuid().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
    type: z.enum([
      'mcq_single',
      'mcq_multiple',
      'true_false',
      'fill_in_the_blank',
      'descriptive',
      'image_based',
      'code_snippet_mcq'
    ]).optional(),
    department: z.string().uuid().optional(),
    company: z.string().uuid().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    visibility: z.enum(['public', 'private', 'college']).optional(),
    page: z.preprocess((val) => parseInt(val as string, 10) || 1, z.number().int().min(1)).default('1'),
    limit: z.preprocess((val) => parseInt(val as string, 10) || 10, z.number().int().min(1).max(100)).default('10'),
    sortBy: z.string().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

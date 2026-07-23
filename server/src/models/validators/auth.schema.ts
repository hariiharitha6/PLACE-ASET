import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
    collegeId: z.union([
      z.string().uuid('Invalid college ID format'),
      z.literal('aset'),
      z.string().min(1)
    ]),
    departmentId: z.union([
      z.string().uuid('Invalid department ID format'),
      z.enum(['cse', 'aiml', 'ece', 'eee', 'me', 'ce']),
      z.string().min(1)
    ]).optional().nullable(),
    year: z.union([z.string(), z.number()]).optional().nullable(),
    section: z.string().optional().nullable(),
    rollNumber: z.string().optional().nullable(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters long').optional(),
    avatarUrl: z.string().url('Invalid URL format').optional().nullable(),
    collegeId: z.union([z.string().uuid('Invalid college ID format'), z.literal('aset')]).optional(),
    departmentId: z.string().uuid('Invalid department ID format').optional().nullable(),
    year: z.string().optional().nullable(),
    section: z.string().optional().nullable(),
    rollNumber: z.string().optional().nullable(),
  }),
});

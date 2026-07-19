import { Response } from 'express';

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: unknown;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function successResponse<T>(res: Response, data: T, statusCode = 200, meta: PaginationMeta | null = null): Response {
  const response: APIResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

export function errorResponse(res: Response, message: string, statusCode = 500, errors: unknown = null): Response {
  const response: APIResponse = { success: false, error: message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
}

export function paginate(page: unknown, limit: unknown): { page: number; limit: number; offset: number } {
  const p = Math.max(1, parseInt(page as string) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
  const offset = (p - 1) * l;
  return { page: p, limit: l, offset };
}

export function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

import { z } from 'zod';

/**
 * Validation schemas for API requests
 */

// Student schema
export const StudentSchema = z.object({
  id: z.string().min(1, 'Student ID is required'),
  name: z.string().min(1, 'Student name is required'),
});

// Create clinic schema
export const CreateClinicSchema = z.object({
  students: z.array(StudentSchema).min(1, 'At least one student is required'),
  programId: z.string().min(1, 'Program ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  contentDefault: z.string().optional(),
  contentsPerStudent: z.record(z.string(), z.string()).optional(),
});

// Create test schema
export const CreateTestSchema = z.object({
  students: z.array(StudentSchema).min(1, 'At least one student is required'),
  programId: z.string().optional(),
  testId: z.string().min(1, 'Test ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});

// Batch score schema
export const BatchScoreSchema = z.object({
  records: z.array(
    z.object({
      id: z.string().min(1),
      score: z.number().min(0).max(100).optional(),
    })
  ),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().optional(),
});

// Search schema  
export const SearchSchema = z.object({
  query: z.string().optional(),
  programId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sort: z.enum(['date', 'name', 'score']).optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Helper function to validate request body
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return {
      success: false,
      error: errors.join(', '),
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}

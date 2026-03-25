import { NextResponse } from 'next/server';

/**
 * Standardized API response utilities
 */

export interface ApiSuccessResponse<T = unknown> {
  ok: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Return a successful JSON response
 */
export function success<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    ok: true,
    data,
  };
  
  if (message !== undefined) {
    response.message = message;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Return an error JSON response
 */
export function error(
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    ok: false,
    error: message,
  };
  
  if (details !== undefined) {
    response.details = details;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Handle validation errors
 */
export function validationError(message: string): NextResponse<ApiErrorResponse> {
  return error(message, 422);
}

/**
 * Handle not found errors
 */
export function notFound(resource = 'Resource'): NextResponse<ApiErrorResponse> {
  return error(`${resource} not found`, 404);
}

/**
 * Handle server errors
 */
export function serverError(message = 'Internal server error'): NextResponse<ApiErrorResponse> {
  return error(message, 500);
}

/**
 * Handle unauthorized errors
 */
export function unauthorized(message = 'Unauthorized'): NextResponse<ApiErrorResponse> {
  return error(message, 401);
}

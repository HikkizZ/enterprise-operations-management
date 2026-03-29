export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT';

export type ServiceResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; code?: ErrorCode } };

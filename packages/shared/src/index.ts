export * from './teachers.js';
export * from './auth.js';
export * from './profile.js';
export * from './dashboard.js';
export * from './teacherSchemas.js';

/** Formato padrão de erro da API */
export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}

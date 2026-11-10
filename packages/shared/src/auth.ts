import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome').max(80),
  email: z.email('E-mail inválido').trim().toLowerCase().max(200),
  password: z
    .string()
    .min(8, 'A senha precisa de pelo menos 8 caracteres')
    .max(128),
});
export type RegisterInput = z.infer<typeof registerSchema>;

/** Schema do formulário de cadastro (front). A API continua usando `registerSchema`. */
export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type RegisterFormInput = z.infer<typeof registerFormSchema>;

export const loginSchema = z.object({
  email: z.email('E-mail inválido').trim().toLowerCase(),
  password: z.string().min(1, 'Informe a senha').max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  hasProfile: boolean;
  createdAt: string;
}

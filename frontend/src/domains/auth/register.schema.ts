import { z } from 'zod';

import { authValidationMessages } from './validation-messages';

export const registerSchema = z.object({
  nombre: z.string().min(2, { error: authValidationMessages.nameTooShort }),
  email: z.email({ error: authValidationMessages.invalidEmail }),
  password: z.string().min(8, { error: authValidationMessages.passwordTooShort })
});

export type RegisterInput = z.infer<typeof registerSchema>;

import { z } from 'zod';

import { authValidationMessages } from './validation-messages';

export const loginSchema = z.object({
  email: z.email({ error: authValidationMessages.invalidEmail }),
  password: z.string().min(1, { error: authValidationMessages.passwordRequired })
});

export type LoginInput = z.infer<typeof loginSchema>;

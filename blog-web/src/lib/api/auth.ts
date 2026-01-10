import { fetchClient } from './client';

export type EmailVerifyResponse = {
  token: string;
  email: string;
  expiresIn: number;
};

export const authApi = {
  verifyEmail: (email: string, code: string) => {
    return fetchClient<EmailVerifyResponse>('/api/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },
};


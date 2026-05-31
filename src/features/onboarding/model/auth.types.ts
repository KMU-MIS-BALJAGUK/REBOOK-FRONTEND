import { AuthSession } from '../../../shared/types/auth.types';

export type AppleLoginInput = {
  identityToken: string;
  authorizationCode: string;
  email?: string;
  name?: string;
  deviceId?: string;
};
export type { AuthSession };

import { useMutation } from '@tanstack/react-query';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { appleLogin } from '../services/authService';
import { AuthSession } from '../model/auth.types';

function logAppleLoginError(stage: string, error: unknown, extra?: Record<string, unknown>) {
  const base =
    typeof error === 'object' && error !== null
      ? {
          name: 'name' in error ? error.name : undefined,
          message: 'message' in error ? error.message : undefined,
          code: 'code' in error ? error.code : undefined,
          stack: 'stack' in error ? error.stack : undefined,
        }
      : { message: String(error) };

  console.error('[apple-login]', {
    stage,
    ...base,
    ...extra,
  });
}

export function useAppleLogin() {
  return useMutation<AuthSession | null, Error>({
    mutationFn: async () => {
      if (Platform.OS !== 'ios') {
        throw new Error('애플 로그인은 iOS에서만 지원돼요.');
      }

      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        throw new Error('현재 기기에서는 애플 로그인을 사용할 수 없어요.');
      }

      let credential: AppleAuthentication.AppleAuthenticationCredential;
      try {
        credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          ],
        });
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'ERR_REQUEST_CANCELED'
        ) {
          return null;
        }
        logAppleLoginError('apple-signin-sdk', error);
        throw error;
      }

      if (!credential.identityToken || !credential.authorizationCode) {
        logAppleLoginError('credential-validation', new Error('missing identityToken or authorizationCode'), {
          hasIdentityToken: Boolean(credential.identityToken),
          hasAuthorizationCode: Boolean(credential.authorizationCode),
          hasEmail: Boolean(credential.email),
        });
        throw new Error('애플 인증 토큰을 가져오지 못했어요.');
      }

      const givenName = credential.fullName?.givenName ?? '';
      const familyName = credential.fullName?.familyName ?? '';
      const fullName = `${familyName}${givenName}`.trim();

      try {
        return await appleLogin({
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          email: credential.email ?? undefined,
          name: fullName || undefined,
        });
      } catch (error) {
        logAppleLoginError('backend-apple-login', error, {
          identityTokenLength: credential.identityToken.length,
          authorizationCodeLength: credential.authorizationCode.length,
          hasEmail: Boolean(credential.email),
          hasName: Boolean(fullName),
        });
        throw error;
      }
    },
  });
}

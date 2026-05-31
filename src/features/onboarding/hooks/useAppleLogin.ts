import { useMutation } from '@tanstack/react-query';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { appleLogin } from '../services/authService';
import { AuthSession } from '../model/auth.types';

export function useAppleLogin() {
  return useMutation<AuthSession, Error>({
    mutationFn: async () => {
      if (Platform.OS !== 'ios') {
        throw new Error('애플 로그인은 iOS에서만 지원돼요.');
      }

      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        throw new Error('현재 기기에서는 애플 로그인을 사용할 수 없어요.');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!credential.identityToken || !credential.authorizationCode) {
        throw new Error('애플 인증 토큰을 가져오지 못했어요.');
      }

      const givenName = credential.fullName?.givenName ?? '';
      const familyName = credential.fullName?.familyName ?? '';
      const fullName = `${familyName}${givenName}`.trim();

      return appleLogin({
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        email: credential.email ?? undefined,
        name: fullName || undefined,
      });
    },
  });
}

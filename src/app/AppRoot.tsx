import React from 'react';
import { useEffect, useState } from 'react';
import { useAppFlow } from './useAppFlow';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { CommunityScreen } from '../features/community/CommunityScreen';
import { AiChatScreen } from '../features/ai-chat/AiChatScreen';
import { MyPageScreen } from '../features/mypage/MyPageScreen';
import { QuoteMethodScreen } from '../features/quote/screens/QuoteMethodScreen';
import { CameraCaptureScreen } from '../features/quote/screens/CameraCaptureScreen';
import { GalleryPickerScreen } from '../features/quote/screens/GalleryPickerScreen';
import { OcrPreviewScreen } from '../features/quote/screens/OcrPreviewScreen';
import { QuoteFormScreen } from '../features/quote/screens/QuoteFormScreen';
import { useQuoteImagePresignedUrl } from '../features/quote/hooks/useQuoteImagePresignedUrl';
import { useQuoteImageOcr } from '../features/quote/hooks/useQuoteImageOcr';
import { useAppleLogin } from '../features/onboarding/hooks/useAppleLogin';
import { useAiStyles } from '../features/onboarding/hooks/useAiStyles';
import { useSaveNickname } from '../features/onboarding/hooks/useSaveNickname';
import { useSaveFirstBook } from '../features/onboarding/hooks/useSaveFirstBook';
import { useSaveAiStyle } from '../features/onboarding/hooks/useSaveAiStyle';
import { useCompleteOnboarding } from '../features/onboarding/hooks/useCompleteOnboarding';
import { hydrateSession, setSession } from '../shared/auth/authSession';
import { toUserMessage } from '../shared/utils/apiError';
import { QuoteOcrBlock } from '../features/quote/model/quoteOcr.types';

export default function AppRoot() {
  const { state, actions } = useAppFlow();
  const appleLoginMutation = useAppleLogin();
  const aiStylesQuery = useAiStyles(state.stepKey === 'mood');
  const saveNicknameMutation = useSaveNickname();
  const saveFirstBookMutation = useSaveFirstBook();
  const saveAiStyleMutation = useSaveAiStyle();
  const completeOnboardingMutation = useCompleteOnboarding();
  const quoteImagePresignedUrlMutation = useQuoteImagePresignedUrl();
  const quoteImageOcrMutation = useQuoteImageOcr();
  const { setAuthSession } = actions;
  const [ocrPreviewBlocks, setOcrPreviewBlocks] = useState<QuoteOcrBlock[] | undefined>(undefined);

  useEffect(() => {
    const syncSession = async () => {
      const session = await hydrateSession();
      if (session) {
        setAuthSession(session);
      }
    };

    syncSession();
  }, [setAuthSession]);

  if (state.screen === 'home') {
    return (
      <HomeScreen
        nickname={state.nickname}
        tab={state.homeTab}
        onChangeTab={actions.setHomeTab}
        onPressRegister={() => actions.setScreen('quote-method')}
        onPressCommunity={() => actions.setScreen('community')}
        onPressAiChat={() => actions.setScreen('ai-chat')}
        onPressMyPage={() => actions.setScreen('mypage')}
      />
    );
  }

  if (state.screen === 'ai-chat') {
    return (
      <AiChatScreen
        nickname={state.nickname}
        onPressHome={() => actions.setScreen('home')}
        onPressCommunity={() => actions.setScreen('community')}
        onPressMyPage={() => actions.setScreen('mypage')}
      />
    );
  }


  if (state.screen === 'mypage') {
    return (
      <MyPageScreen
        nickname={state.nickname}
        onPressHome={() => actions.setScreen('home')}
        onPressCommunity={() => actions.setScreen('community')}
        onPressAiChat={() => actions.setScreen('ai-chat')}
      />
    );
  }

  if (state.screen === 'community') {
    return (
      <CommunityScreen
        nickname={state.nickname}
        onPressHome={() => actions.setScreen('home')}
        onPressAiChat={() => actions.setScreen('ai-chat')}
        onPressMyPage={() => actions.setScreen('mypage')}
      />
    );
  }

  if (state.screen === 'quote-method') {
    return (
      <QuoteMethodScreen
        nickname={state.nickname}
        tab={state.homeTab}
        onChangeTab={actions.setHomeTab}
        onClose={() => actions.setScreen('home')}
        onSelect={(type) => {
          actions.setRegisterType(type);
          if (type === 'camera') actions.setScreen('camera-capture');
          if (type === 'gallery') actions.setScreen('gallery-picker');
          if (type === 'manual') actions.setScreen('quote-form');
        }}
      />
    );
  }

  if (state.screen === 'camera-capture') {
    return (
      <CameraCaptureScreen
        onBack={() => actions.setScreen('quote-method')}
        isUploading={quoteImagePresignedUrlMutation.isPending || quoteImageOcrMutation.isPending}
        uploadError={
          quoteImagePresignedUrlMutation.isError
            ? toUserMessage(quoteImagePresignedUrlMutation.error)
            : quoteImageOcrMutation.isError
              ? toUserMessage(quoteImageOcrMutation.error)
              : null
        }
        onCapture={() => {
          setOcrPreviewBlocks(undefined);
          quoteImagePresignedUrlMutation.mutate(
            {
              fileName: `camera-${Date.now()}.jpg`,
              contentType: 'image/jpeg',
              fileSize: 345678,
              purpose: 'QUOTE_OCR',
            },
            {
              onSuccess: (presigned) => {
                quoteImageOcrMutation.mutate(
                  {
                    imageId: presigned.imageId,
                    imageUrl: presigned.publicUrl,
                  },
                  {
                    onSuccess: (ocr) => {
                      setOcrPreviewBlocks(ocr.blocks);
                      actions.setScreen('ocr-preview');
                    },
                  },
                );
              },
            },
          );
        }}
      />
    );
  }

  if (state.screen === 'gallery-picker') {
    return (
      <GalleryPickerScreen
        onBack={() => actions.setScreen('quote-method')}
        isUploading={quoteImagePresignedUrlMutation.isPending || quoteImageOcrMutation.isPending}
        uploadError={
          quoteImagePresignedUrlMutation.isError
            ? toUserMessage(quoteImagePresignedUrlMutation.error)
            : quoteImageOcrMutation.isError
              ? toUserMessage(quoteImageOcrMutation.error)
              : null
        }
        onPick={() => {
          setOcrPreviewBlocks(undefined);
          quoteImagePresignedUrlMutation.mutate(
            {
              fileName: `gallery-${Date.now()}.webp`,
              contentType: 'image/webp',
              fileSize: 345678,
              purpose: 'QUOTE_OCR',
            },
            {
              onSuccess: (presigned) => {
                quoteImageOcrMutation.mutate(
                  {
                    imageId: presigned.imageId,
                    imageUrl: presigned.publicUrl,
                  },
                  {
                    onSuccess: (ocr) => {
                      setOcrPreviewBlocks(ocr.blocks);
                      actions.setScreen('ocr-preview');
                    },
                  },
                );
              },
            },
          );
        }}
      />
    );
  }

  if (state.screen === 'ocr-preview') {
    return (
      <OcrPreviewScreen
        onBack={() => actions.setScreen(state.registerType === 'camera' ? 'camera-capture' : 'gallery-picker')}
        onNext={() => actions.setScreen('quote-form')}
        blocks={ocrPreviewBlocks}
      />
    );
  }

  if (state.screen === 'quote-form') {
    return (
      <QuoteFormScreen
        onBack={() => actions.setScreen('home')}
        initialMethod={state.registerType}
        ocrFilled={state.registerType === 'camera' || state.registerType === 'gallery'}
      />
    );
  }

  return (
    <OnboardingScreen
      step={state.step}
      stepKey={state.stepKey}
      totalSteps={state.totalSteps}
      nickname={state.nickname}
      bookTitle={state.bookTitle}
      author={state.author}
      selectedRecordOption={state.selectedRecordOption}
      selectedMood={state.selectedMood}
      isNextDisabled={state.isNextDisabled}
      isAppleLoginLoading={appleLoginMutation.isPending}
      appleLoginError={appleLoginMutation.isError ? toUserMessage(appleLoginMutation.error) : null}
      isNicknameSaving={saveNicknameMutation.isPending}
      nicknameSaveError={saveNicknameMutation.isError ? toUserMessage(saveNicknameMutation.error) : null}
      isFirstBookSaving={saveFirstBookMutation.isPending}
      firstBookSaveError={saveFirstBookMutation.isError ? toUserMessage(saveFirstBookMutation.error) : null}
      aiStyles={aiStylesQuery.data ?? []}
      isAiStylesLoading={aiStylesQuery.isLoading}
      aiStylesError={aiStylesQuery.isError ? toUserMessage(aiStylesQuery.error) : null}
      isAiStyleSaving={saveAiStyleMutation.isPending}
      aiStyleSaveError={saveAiStyleMutation.isError ? toUserMessage(saveAiStyleMutation.error) : null}
      isCompleteSaving={completeOnboardingMutation.isPending}
      completeSaveError={completeOnboardingMutation.isError ? toUserMessage(completeOnboardingMutation.error) : null}
      onRetryAiStyles={() => {
        void aiStylesQuery.refetch();
      }}
      onNicknameChange={actions.setNickname}
      onBookTitleChange={actions.setBookTitle}
      onAuthorChange={actions.setAuthor}
      onRecordOptionChange={actions.setSelectedRecordOption}
      onMoodChange={actions.setSelectedMood}
      onPrev={actions.goPrev}
      onNext={() => {
        if (state.stepKey === 'nickname') {
          saveNicknameMutation.mutate(
            { nickname: state.nickname.trim() },
            {
              onSuccess: (result) => {
                actions.setNickname(result.nickname);
                actions.goNext();
              },
            },
          );
          return;
        }
        if (state.stepKey === 'book') {
          const input =
            state.selectedRecordOption === 'now'
              ? {
                  selectionType: 'CURRENT_BOOK' as const,
                  book: {
                    title: state.bookTitle.trim(),
                    author: state.author.trim(),
                  },
                }
              : state.selectedRecordOption === 'finished'
                ? {
                    selectionType: 'FINISHED_BOOK' as const,
                    book: {
                      title: state.bookTitle.trim(),
                      author: state.author.trim(),
                    },
                  }
                : {
                    selectionType: 'SKIP' as const,
                  };

          saveFirstBookMutation.mutate(input, {
            onSuccess: () => {
              actions.goNext();
            },
          });
          return;
        }
        if (state.stepKey === 'mood') {
          saveAiStyleMutation.mutate(
            { styleCode: state.selectedMood },
            {
              onSuccess: () => {
                actions.goNext();
              },
            },
          );
          return;
        }
        if (state.stepKey === 'done') {
          completeOnboardingMutation.mutate(
            { completed: true },
            {
              onSuccess: (result) => {
                if (result.redirectTo === 'HOME') {
                  actions.setScreen('home');
                  return;
                }
                actions.goNext();
              },
            },
          );
          return;
        }

        actions.goNext();
      }}
      onAppleLoginPress={() => {
        appleLoginMutation.mutate(undefined, {
          onSuccess: (session) => {
            if (!session) {
              return;
            }
            actions.setAuthSession(session);
            void setSession(session);
            actions.goNext();
          },
        });
      }}
    />
  );
}

import React from 'react';
import { useDeferredValue, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
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
import { useQuoteImageUpload } from '../features/quote/hooks/useQuoteImageUpload';
import { useAppleLogin } from '../features/onboarding/hooks/useAppleLogin';
import { useAiStyles } from '../features/onboarding/hooks/useAiStyles';
import { useSaveNickname } from '../features/onboarding/hooks/useSaveNickname';
import { useSaveFirstBook } from '../features/onboarding/hooks/useSaveFirstBook';
import { useSaveAiStyle } from '../features/onboarding/hooks/useSaveAiStyle';
import { useCompleteOnboarding } from '../features/onboarding/hooks/useCompleteOnboarding';
import { useSearchOnboardingBooks } from '../features/onboarding/hooks/useSearchOnboardingBooks';
import { hydrateSession, setSession } from '../shared/auth/authSession';
import { toUserMessage } from '../shared/utils/apiError';
import { QuoteOcrBlock } from '../features/quote/model/quoteOcr.types';
import { QuoteImageUploadInput } from '../features/quote/model/quoteImageUpload.types';
import { QuoteImageAttachmentResult } from '../features/quote/model/quoteImageAttachment.types';

type OcrQuoteContext = QuoteImageAttachmentResult;

type UserFacingError = Error & {
  userMessage: string;
};

type PreparedQuoteImageAsset = {
  blob: Blob;
  fileName: string;
  contentType: string;
  fileSize: number;
};

function createUserFacingError(message: string): UserFacingError {
  const error = new Error(message) as UserFacingError;
  error.userMessage = message;
  return error;
}

function resolveQuoteImageFileExtension(contentType: string, fileName?: string | null) {
  const currentExtension = fileName?.split('.').pop()?.trim().toLowerCase();
  if (currentExtension) {
    return currentExtension;
  }
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

async function prepareQuoteImageAsset(asset: ImagePicker.ImagePickerAsset): Promise<PreparedQuoteImageAsset> {
  const response = await fetch(asset.uri);
  const blob = await response.blob();
  const contentType = asset.mimeType ?? 'image/jpeg';
  const fileName = asset.fileName ?? `quote-image-${Date.now()}.${resolveQuoteImageFileExtension(contentType, asset.fileName)}`;

  return {
    blob,
    fileName,
    contentType,
    fileSize: asset.fileSize ?? blob.size,
  };
}

export default function AppRoot() {
  const { state, actions } = useAppFlow();
  const appleLoginMutation = useAppleLogin();
  const aiStylesQuery = useAiStyles(state.stepKey === 'mood');
  const saveNicknameMutation = useSaveNickname();
  const saveFirstBookMutation = useSaveFirstBook();
  const saveAiStyleMutation = useSaveAiStyle();
  const completeOnboardingMutation = useCompleteOnboarding();
  const deferredBookTitle = useDeferredValue(state.bookTitle);
  const deferredAuthor = useDeferredValue(state.author);
  const onboardingBookSearchQuery =
    deferredBookTitle.trim() || deferredAuthor.trim();
  const onboardingBookSearchEnabled =
    state.stepKey === 'book' &&
    (state.selectedRecordOption === 'now' || state.selectedRecordOption === 'finished') &&
    onboardingBookSearchQuery.length > 0;
  const onboardingBookSearchQueryResult = useSearchOnboardingBooks(
    onboardingBookSearchQuery,
    onboardingBookSearchEnabled,
  );
  const quoteImagePresignedUrlMutation = useQuoteImagePresignedUrl();
  const quoteImageUploadMutation = useQuoteImageUpload();
  const quoteImageOcrMutation = useQuoteImageOcr();
  const { setAuthSession, setScreen } = actions;
  const [ocrPreviewBlocks, setOcrPreviewBlocks] = useState<QuoteOcrBlock[] | undefined>(undefined);
  const [ocrQuoteContext, setOcrQuoteContext] = useState<OcrQuoteContext | undefined>(undefined);
  const [quoteImageFlowError, setQuoteImageFlowError] = useState<string | null>(null);

  const processQuoteImageAsset = async (
    asset: ImagePicker.ImagePickerAsset,
    shouldNavigateToPreview: boolean,
  ): Promise<QuoteImageAttachmentResult> => {
    setQuoteImageFlowError(null);
    setOcrPreviewBlocks(undefined);
    setOcrQuoteContext(undefined);

    const preparedAsset = await prepareQuoteImageAsset(asset);
    const presigned = await quoteImagePresignedUrlMutation.mutateAsync({
      fileName: preparedAsset.fileName,
      contentType: preparedAsset.contentType,
      fileSize: preparedAsset.fileSize,
      purpose: 'QUOTE_OCR',
    });

    await quoteImageUploadMutation.mutateAsync({
      uploadUrl: presigned.uploadUrl,
      method: presigned.method,
      headers: presigned.headers,
      blob: preparedAsset.blob,
    } satisfies QuoteImageUploadInput);

    const ocr = await quoteImageOcrMutation.mutateAsync({
      imageId: presigned.imageId,
      imageUrl: presigned.publicUrl,
    });

    const attachmentResult = {
      imageId: ocr.imageId,
      ocrId: ocr.ocrId,
      fullText: ocr.fullText,
      blockIds: ocr.blocks.filter((block) => block.selected).map((block) => block.blockId),
    };

    if (shouldNavigateToPreview) {
      setOcrPreviewBlocks(ocr.blocks);
      setOcrQuoteContext(attachmentResult);
      actions.setScreen('ocr-preview');
    }

    return attachmentResult;
  };

  const launchCameraQuoteFlow = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setQuoteImageFlowError('카메라 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
        cameraType: ImagePicker.CameraType.back,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      await processQuoteImageAsset(result.assets[0], true);
    } catch (error) {
      setQuoteImageFlowError(toUserMessage(error));
    }
  };

  const launchGalleryQuoteFlow = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setQuoteImageFlowError('사진 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      await processQuoteImageAsset(result.assets[0], true);
    } catch (error) {
      setQuoteImageFlowError(toUserMessage(error));
    }
  };

  const attachQuoteImageFromGallery = async (): Promise<QuoteImageAttachmentResult | null> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw createUserFacingError('사진 접근 권한이 필요합니다.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.length) {
        return null;
      }

      return await processQuoteImageAsset(result.assets[0], false);
    } catch (error) {
      throw error instanceof Error ? error : createUserFacingError('이미지 첨부에 실패했어요.');
    }
  };

  useEffect(() => {
    const syncSession = async () => {
      const session = await hydrateSession();
      if (session) {
        setAuthSession(session);
        if (!session.firstLogin) {
          setScreen('home');
        }
      }
    };

    syncSession();
  }, [setAuthSession, setScreen]);

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
        onLoggedOut={actions.resetToLoggedOut}
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
        onBack={() => {
          setQuoteImageFlowError(null);
          actions.setScreen('quote-method');
        }}
        isUploading={
          quoteImagePresignedUrlMutation.isPending ||
          quoteImageUploadMutation.isPending ||
          quoteImageOcrMutation.isPending
        }
        uploadError={
          quoteImageFlowError ??
          (quoteImagePresignedUrlMutation.isError
            ? toUserMessage(quoteImagePresignedUrlMutation.error)
            : quoteImageUploadMutation.isError
              ? toUserMessage(quoteImageUploadMutation.error)
              : quoteImageOcrMutation.isError
                ? toUserMessage(quoteImageOcrMutation.error)
                : null)
        }
        onCapture={() => {
          void launchCameraQuoteFlow();
        }}
      />
    );
  }

  if (state.screen === 'gallery-picker') {
    return (
      <GalleryPickerScreen
        onBack={() => {
          setQuoteImageFlowError(null);
          actions.setScreen('quote-method');
        }}
        isUploading={
          quoteImagePresignedUrlMutation.isPending ||
          quoteImageUploadMutation.isPending ||
          quoteImageOcrMutation.isPending
        }
        uploadError={
          quoteImageFlowError ??
          (quoteImagePresignedUrlMutation.isError
            ? toUserMessage(quoteImagePresignedUrlMutation.error)
            : quoteImageUploadMutation.isError
              ? toUserMessage(quoteImageUploadMutation.error)
              : quoteImageOcrMutation.isError
                ? toUserMessage(quoteImageOcrMutation.error)
                : null)
        }
        onPick={() => {
          void launchGalleryQuoteFlow();
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
        onSaved={() => actions.setScreen('home')}
        initialMethod={state.registerType}
        initialQuoteText={
          state.registerType === 'camera' || state.registerType === 'gallery' ? (ocrQuoteContext?.fullText ?? '') : ''
        }
        ocrSource={
          ocrQuoteContext
            ? {
                imageId: ocrQuoteContext.imageId,
                ocrId: ocrQuoteContext.ocrId,
                blockIds: ocrQuoteContext.blockIds,
              }
            : undefined
        }
        onAttachImage={attachQuoteImageFromGallery}
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
      searchedBooks={onboardingBookSearchQueryResult.data?.books ?? []}
      isBookSearchLoading={onboardingBookSearchQueryResult.isLoading}
      bookSearchError={onboardingBookSearchQueryResult.isError ? toUserMessage(onboardingBookSearchQueryResult.error) : null}
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
      onBookSelect={(book) => {
        actions.setBookTitle(book.title);
        actions.setAuthor(book.author);
      }}
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
            if (session.firstLogin) {
              actions.goNext();
              return;
            }
            actions.setScreen('home');
          },
        });
      }}
    />
  );
}

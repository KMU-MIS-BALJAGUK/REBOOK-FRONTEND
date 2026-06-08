import React, { useDeferredValue, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { View } from 'react-native';
import { useAppFlow } from './useAppFlow';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { CommunityScreen } from '../features/community/CommunityScreen';
import { AiChatScreen } from '../features/ai-chat/AiChatScreen';
import { MyPageScreen } from '../features/mypage/MyPageScreen';
import { QuoteMethodScreen } from '../features/quote/screens/QuoteMethodScreen';
import { CameraCaptureScreen } from '../features/quote/screens/CameraCaptureScreen';
import { CameraCropScreen } from '../features/quote/screens/CameraCropScreen';
import { OcrPreviewScreen } from '../features/quote/screens/OcrPreviewScreen';
import { QuoteFormScreen } from '../features/quote/screens/QuoteFormScreen';
import { QuoteQuestionCardsScreen } from '../features/quote/screens/QuoteQuestionCardsScreen';
import { useQuoteImagePresignedUrl } from '../features/quote/hooks/useQuoteImagePresignedUrl';
import { useQuoteImageOcr } from '../features/quote/hooks/useQuoteImageOcr';
import { useQuoteImageUpload } from '../features/quote/hooks/useQuoteImageUpload';
import { useGenerateQuoteQuestionCards } from '../features/quote/hooks/useGenerateQuoteQuestionCards';
import { useQuoteQuestionCards } from '../features/quote/hooks/useQuoteQuestionCards';
import { useAppleLogin } from '../features/onboarding/hooks/useAppleLogin';
import { useAiStyles } from '../features/onboarding/hooks/useAiStyles';
import { useSaveNickname } from '../features/onboarding/hooks/useSaveNickname';
import { useSaveFirstBook } from '../features/onboarding/hooks/useSaveFirstBook';
import { useSaveAiStyle } from '../features/onboarding/hooks/useSaveAiStyle';
import { useCompleteOnboarding } from '../features/onboarding/hooks/useCompleteOnboarding';
import { useSearchOnboardingBooks } from '../features/onboarding/hooks/useSearchOnboardingBooks';
import { hydrateSession, setSession } from '../shared/auth/authSession';
import { API_BASE_URL } from '../shared/constants/api';
import { toUserMessage } from '../shared/utils/apiError';
import { QuoteOcrBlock } from '../features/quote/model/quoteOcr.types';
import { QuoteImageUploadInput } from '../features/quote/model/quoteImageUpload.types';
import { QuoteImageAttachmentResult } from '../features/quote/model/quoteImageAttachment.types';
import { QuoteLocalImageAsset } from '../features/quote/model/quoteLocalImage.types';
import { CreateQuoteResult } from '../features/quote/model/quoteCreate.types';
import {
  QuoteQuestionCardItem,
  QuoteQuestionCardQuoteSummary,
  QuoteQuestionCardStatus,
} from '../features/quote/model/quoteQuestionCard.types';
import { DeepReadingChatLaunchContext } from '../features/ai-chat/model/deepReadingChat.types';
import { BottomNav } from '../shared/ui/BottomNav';

type OcrQuoteContext = QuoteImageAttachmentResult;

type UserFacingError = Error & {
  userMessage: string;
};

type PreparedQuoteImageAsset = {
  fileUri: string;
  fileName: string;
  contentType: string;
  fileSize: number;
};

function toQuestionCardQuoteSummary(result: CreateQuoteResult): QuoteQuestionCardQuoteSummary {
  return {
    quoteId: result.quoteId,
    bookTitle: result.book.title,
    author: result.book.author,
    pageNumber: result.pageNumber,
    quoteText: result.quoteText,
  };
}

function createUserFacingError(message: string): UserFacingError {
  const error = new Error(message) as UserFacingError;
  error.userMessage = message;
  return error;
}

function MainTabShell({
  active,
  onPressCommunity,
  onPressHome,
  onPressAiChat,
  showBottomNav = true,
  children,
}: {
  active: 'community' | 'home' | 'ai-chat';
  onPressCommunity: () => void;
  onPressHome: () => void;
  onPressAiChat: () => void;
  showBottomNav?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1 }}>
      {children}
      {showBottomNav ? (
        <BottomNav active={active} onPressCommunity={onPressCommunity} onPressHome={onPressHome} onPressAiChat={onPressAiChat} />
      ) : null}
    </View>
  );
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

function resolveRemoteImageUrl(url: string | null | undefined): string {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return `${API_BASE_URL}/${trimmed}`;
}

async function prepareQuoteImageAsset(asset: QuoteLocalImageAsset): Promise<PreparedQuoteImageAsset> {
  if (typeof asset.uri !== 'string' || !asset.uri.trim()) {
    throw createUserFacingError('이미지 경로를 확인할 수 없어요.');
  }
  console.log('[QUOTE_IMAGE] prepare start', {
    uri: asset.uri,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    fileSize: asset.fileSize,
    width: asset.width,
    height: asset.height,
  });
  const contentType = asset.mimeType ?? 'image/jpeg';
  const fileName = asset.fileName ?? `quote-image-${Date.now()}.${resolveQuoteImageFileExtension(contentType, asset.fileName)}`;
  const file = new File(asset.uri);
  console.log('[QUOTE_IMAGE] prepare done', {
    fileName,
    contentType,
    fileSize: asset.fileSize ?? file.size,
  });

  return {
    fileUri: asset.uri,
    fileName,
    contentType,
    fileSize: asset.fileSize ?? file.size,
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
  const generateQuoteQuestionCardsMutation = useGenerateQuoteQuestionCards();
  const { setAuthSession, setScreen } = actions;
  const [ocrPreviewBlocks, setOcrPreviewBlocks] = useState<QuoteOcrBlock[] | undefined>(undefined);
  const [ocrQuoteContext, setOcrQuoteContext] = useState<OcrQuoteContext | undefined>(undefined);
  const [quoteImageFlowError, setQuoteImageFlowError] = useState<string | null>(null);
  const [pendingCropAsset, setPendingCropAsset] = useState<QuoteLocalImageAsset | undefined>(undefined);
  const [pendingCropSource, setPendingCropSource] = useState<'camera' | 'gallery' | null>(null);
  const [savedQuoteForQuestions, setSavedQuoteForQuestions] = useState<QuoteQuestionCardQuoteSummary | null>(null);
  const [aiChatLaunchContext, setAiChatLaunchContext] = useState<DeepReadingChatLaunchContext | null>(null);
  const [aiChatView, setAiChatView] = useState<'list' | 'room'>('list');
  const quoteQuestionCardsQuery = useQuoteQuestionCards({
    quoteId: savedQuoteForQuestions?.quoteId ?? null,
    enabled: state.screen === 'quote-question-cards',
  });

  const processQuoteImageAsset = async (
    asset: QuoteLocalImageAsset,
    shouldNavigateToPreview: boolean,
  ): Promise<QuoteImageAttachmentResult> => {
    setQuoteImageFlowError(null);
    setOcrPreviewBlocks(undefined);
    setOcrQuoteContext(undefined);

    console.log('[QUOTE_IMAGE] flow start', {
      shouldNavigateToPreview,
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    });

    const normalizedAsset = asset;
    const preparedAsset = await prepareQuoteImageAsset(normalizedAsset);
    const presigned = await quoteImagePresignedUrlMutation.mutateAsync({
      fileName: preparedAsset.fileName,
      contentType: preparedAsset.contentType,
      fileSize: preparedAsset.fileSize,
      purpose: 'QUOTE_OCR',
    });
    console.log('[QUOTE_IMAGE] presigned received', {
      imageId: presigned.imageId,
      objectKey: presigned.objectKey,
      method: presigned.method,
      expiresIn: presigned.expiresIn,
      publicUrl: presigned.publicUrl,
    });
    const resolvedImageUrl =
      resolveRemoteImageUrl(presigned.publicUrl) || resolveRemoteImageUrl(presigned.objectKey);

    await quoteImageUploadMutation.mutateAsync({
      uploadUrl: presigned.uploadUrl,
      method: presigned.method,
      headers: presigned.headers,
      fileUri: preparedAsset.fileUri,
      mimeType: preparedAsset.contentType,
    } satisfies QuoteImageUploadInput);
    console.log('[QUOTE_IMAGE] upload done', {
      imageId: presigned.imageId,
      objectKey: presigned.objectKey,
    });

    const ocr = await quoteImageOcrMutation.mutateAsync({
      imageId: presigned.imageId,
      imageUrl: resolvedImageUrl,
    });
    console.log('[QUOTE_IMAGE] ocr done', {
      imageId: ocr.imageId,
      ocrId: ocr.ocrId,
      status: ocr.status,
      blocks: ocr.blocks.length,
      confidence: ocr.confidence,
    });

    const attachmentResult = {
      imageId: ocr.imageId,
      ocrId: ocr.ocrId,
      fullText: ocr.fullText,
      blockIds: ocr.blocks.filter((block) => block.selected).map((block) => block.blockId),
      previewImageUri: normalizedAsset.uri,
    };

    if (shouldNavigateToPreview) {
      setOcrPreviewBlocks(ocr.blocks);
      setOcrQuoteContext(attachmentResult);
      actions.setScreen('ocr-preview');
    }

    return attachmentResult;
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

      setQuoteImageFlowError(null);
      setPendingCropSource('gallery');
      setPendingCropAsset(result.assets[0]);
      actions.setScreen('camera-crop');
    } catch (error) {
      setQuoteImageFlowError(toUserMessage(error));
    }
  };

  const quoteQuestionStatus: QuoteQuestionCardStatus =
    generateQuoteQuestionCardsMutation.isError ||
    quoteQuestionCardsQuery.isError ||
    quoteQuestionCardsQuery.data?.status === 'FAILED' ||
    quoteQuestionCardsQuery.data?.lastRunStatus === 'FAILED'
      ? 'error'
      : generateQuoteQuestionCardsMutation.isPending ||
          quoteQuestionCardsQuery.data?.status === 'GENERATING'
        ? 'loading'
        : quoteQuestionCardsQuery.data?.status === 'READY'
          ? quoteQuestionCardsQuery.data.questions.length > 0
            ? 'success'
            : 'empty'
          : 'idle';

  const openQuoteQuestionCards = (result: CreateQuoteResult) => {
    openQuoteQuestionCardsFromSummary(toQuestionCardQuoteSummary(result));
  };

  const openQuoteQuestionCardsFromSummary = (quote: QuoteQuestionCardQuoteSummary) => {
    setSavedQuoteForQuestions(quote);
    generateQuoteQuestionCardsMutation.reset();
    actions.setScreen('quote-question-cards');
  };

  const requestQuoteQuestionCards = () => {
    if (!savedQuoteForQuestions) {
      return;
    }
    generateQuoteQuestionCardsMutation.mutate(
      { quoteId: savedQuoteForQuestions.quoteId },
      {
        onSuccess: async () => {
          await quoteQuestionCardsQuery.refetch();
        },
      },
    );
  };

  const resetQuoteQuestionCards = () => {
    setSavedQuoteForQuestions(null);
    generateQuoteQuestionCardsMutation.reset();
  };

  const startAiChatFromQuestionCard = (card: QuoteQuestionCardItem) => {
    if (!savedQuoteForQuestions) {
      return;
    }

    setAiChatLaunchContext({
      quoteSource: {
        quoteId: savedQuoteForQuestions.quoteId,
        bookTitle: savedQuoteForQuestions.bookTitle,
        author: savedQuoteForQuestions.author,
        pageNumber: savedQuoteForQuestions.pageNumber,
        quoteText: savedQuoteForQuestions.quoteText,
      },
      starterQuestion: {
        id: String(card.cardId),
        type: card.type,
        question: card.question,
      },
      initialMessage: `저장한 문장: "${savedQuoteForQuestions.quoteText}"\n선택한 질문: "${card.question}"\n이 질문으로 AI 채팅을 시작하고 싶어요.`,
    });
    resetQuoteQuestionCards();
    actions.setScreen('ai-chat');
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
      <MainTabShell
        active="home"
        onPressCommunity={() => actions.setScreen('community')}
        onPressHome={() => {}}
        onPressAiChat={() => actions.setScreen('ai-chat')}
      >
        <HomeScreen
          nickname={state.nickname}
          tab={state.homeTab}
          onChangeTab={actions.setHomeTab}
          onPressRegister={() => actions.setScreen('quote-method')}
          onPressCommunity={() => actions.setScreen('community')}
          onPressAiChat={() => actions.setScreen('ai-chat')}
          onPressMyPage={() => actions.setScreen('mypage')}
          onPressGenerateQuestions={(quote) => openQuoteQuestionCardsFromSummary(quote)}
          showBottomNav={false}
        />
      </MainTabShell>
    );
  }

  if (state.screen === 'ai-chat') {
    return (
      <MainTabShell
        active="ai-chat"
        onPressCommunity={() => actions.setScreen('community')}
        onPressHome={() => actions.setScreen('home')}
        onPressAiChat={() => {}}
        showBottomNav={aiChatView === 'list'}
      >
        <AiChatScreen
          nickname={state.nickname}
          onPressHome={() => actions.setScreen('home')}
          onPressCommunity={() => actions.setScreen('community')}
          onPressMyPage={() => actions.setScreen('mypage')}
          launchContext={aiChatLaunchContext}
          onConsumeLaunchContext={() => setAiChatLaunchContext(null)}
          showBottomNav={false}
          onViewChange={setAiChatView}
        />
      </MainTabShell>
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
      <MainTabShell
        active="community"
        onPressCommunity={() => {}}
        onPressHome={() => actions.setScreen('home')}
        onPressAiChat={() => actions.setScreen('ai-chat')}
      >
        <CommunityScreen
          nickname={state.nickname}
          onPressHome={() => actions.setScreen('home')}
          onPressAiChat={() => actions.setScreen('ai-chat')}
          onPressMyPage={() => actions.setScreen('mypage')}
          showBottomNav={false}
        />
      </MainTabShell>
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
          if (type === 'gallery') {
            void launchGalleryQuoteFlow();
          }
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
          setPendingCropAsset(undefined);
          setPendingCropSource(null);
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
        onCapture={async (asset) => {
          setQuoteImageFlowError(null);
          setPendingCropSource('camera');
          setPendingCropAsset(asset);
          actions.setScreen('camera-crop');
        }}
      />
    );
  }

  if (state.screen === 'camera-crop') {
    if (!pendingCropAsset) {
      return null;
    }

    return (
      <CameraCropScreen
        asset={pendingCropAsset}
        onBack={() => {
          setQuoteImageFlowError(null);
          if (pendingCropSource === 'camera') {
            actions.setScreen('camera-capture');
            return;
          }
          setPendingCropAsset(undefined);
          setPendingCropSource(null);
          actions.setScreen('quote-method');
        }}
        isSubmitting={
          quoteImagePresignedUrlMutation.isPending ||
          quoteImageUploadMutation.isPending ||
          quoteImageOcrMutation.isPending
        }
        submitError={
          quoteImageFlowError ??
          (quoteImagePresignedUrlMutation.isError
            ? toUserMessage(quoteImagePresignedUrlMutation.error)
            : quoteImageUploadMutation.isError
              ? toUserMessage(quoteImageUploadMutation.error)
              : quoteImageOcrMutation.isError
                ? toUserMessage(quoteImageOcrMutation.error)
                : null)
        }
        onConfirm={async (asset) => {
          await processQuoteImageAsset(asset, true)
            .then(() => {
              setPendingCropAsset(asset);
            })
            .catch((error) => {
              console.log('[QUOTE_IMAGE] flow error', error);
              setQuoteImageFlowError(toUserMessage(error));
            });
        }}
      />
    );
  }

  if (state.screen === 'ocr-preview') {
    return (
      <OcrPreviewScreen
        onBack={() => actions.setScreen(state.registerType === 'manual' ? 'quote-method' : 'camera-crop')}
        onNext={(selectedText, selectedBlockIds) => {
          setOcrPreviewBlocks((currentBlocks) =>
            currentBlocks?.map((block) => ({
              ...block,
              selected: selectedBlockIds.includes(block.blockId),
            })),
          );
          setOcrQuoteContext((currentContext) =>
            currentContext
              ? {
                  ...currentContext,
                  fullText: selectedText,
                  blockIds: selectedBlockIds,
                }
              : currentContext,
          );
          actions.setScreen('quote-form');
        }}
        blocks={ocrPreviewBlocks}
        text={ocrQuoteContext?.fullText}
      />
    );
  }

  if (state.screen === 'quote-form') {
    return (
      <QuoteFormScreen
        onBack={() => actions.setScreen('home')}
        onSaved={(result) => openQuoteQuestionCards(result)}
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
        onAttachImage={async (asset) => processQuoteImageAsset(asset, false)}
      />
    );
  }

  if (state.screen === 'quote-question-cards') {
    if (!savedQuoteForQuestions) {
      return null;
    }

    return (
      <QuoteQuestionCardsScreen
        quote={savedQuoteForQuestions}
        status={quoteQuestionStatus}
        cards={quoteQuestionCardsQuery.data?.questions ?? []}
        questionsResult={quoteQuestionCardsQuery.data ?? null}
        errorMessage={
          generateQuoteQuestionCardsMutation.isError
            ? toUserMessage(generateQuoteQuestionCardsMutation.error)
            : quoteQuestionCardsQuery.isError
              ? toUserMessage(quoteQuestionCardsQuery.error)
              : quoteQuestionCardsQuery.data?.lastRunStatus === 'FAILED'
                ? 'AI 질문 카드 생성에 실패했어요.'
                : null
        }
        onBack={() => {
          resetQuoteQuestionCards();
          actions.setScreen('home');
        }}
        onSkip={() => {
          resetQuoteQuestionCards();
          actions.setScreen('home');
        }}
        onDone={() => {
          resetQuoteQuestionCards();
          actions.setScreen('home');
        }}
        onGenerate={requestQuoteQuestionCards}
        onStartChat={startAiChatFromQuestionCard}
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

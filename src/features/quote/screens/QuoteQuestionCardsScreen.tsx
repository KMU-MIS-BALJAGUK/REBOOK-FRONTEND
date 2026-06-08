import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GetQuoteQuestionCardsResult,
  QuoteQuestionCardItem,
  QuoteQuestionCardQuoteSummary,
  QuoteQuestionCardStatus,
} from '../model/quoteQuestionCard.types';

type Props = {
  quote: QuoteQuestionCardQuoteSummary;
  status: QuoteQuestionCardStatus;
  cards: QuoteQuestionCardItem[];
  questionsResult?: GetQuoteQuestionCardsResult | null;
  errorMessage?: string | null;
  onBack: () => void;
  onSkip: () => void;
  onDone: () => void;
  onGenerate: () => void;
  onStartChat: (item: QuoteQuestionCardItem) => void;
};

export function QuoteQuestionCardsScreen({
  quote,
  status,
  cards,
  errorMessage,
  onBack,
  onSkip,
  onDone,
  onGenerate,
  onStartChat,
}: Props) {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [resultReady, setResultReady] = useState(true);
  const previousStatusRef = useRef<QuoteQuestionCardStatus>(status);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearProgressTimers = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    setSelectedCardId(null);
  }, [quote.quoteId]);

  useEffect(() => {
    if (status !== 'loading') {
      return;
    }

    clearProgressTimers();
    setLoadingProgress(0);
    setResultReady(false);

    loadingIntervalRef.current = setInterval(() => {
      setLoadingProgress((current) => Math.min(current + 2, 80));
    }, 125);

    return clearProgressTimers;
  }, [status]);

  useEffect(() => {
    if (previousStatusRef.current === 'loading' && status !== 'loading') {
      setResultReady(false);
      clearProgressTimers();

      const advanceToFull = () => {
        setLoadingProgress((current) => {
          if (current >= 100) {
            return 100;
          }

          const next = Math.min(current + 4, 100);
          if (next < 100) {
            settleTimeoutRef.current = setTimeout(advanceToFull, 70);
          } else {
            settleTimeoutRef.current = setTimeout(() => {
              setResultReady(true);
              settleTimeoutRef.current = null;
            }, 120);
          }
          return next;
        });
      };

      settleTimeoutRef.current = setTimeout(advanceToFull, 60);
      previousStatusRef.current = status;
      return clearProgressTimers;
    }

    if (status !== 'loading') {
      setResultReady(true);
    }

    previousStatusRef.current = status;
  }, [status]);

  const isLoadingView = status === 'loading' || !resultReady;
  const selectedCard = useMemo(
    () => cards.find((item) => item.cardId === selectedCardId) ?? null,
    [cards, selectedCardId],
  );

  const canGenerate = status === 'idle' || status === 'error';
  const shouldShowSuccessView = status === 'success' && resultReady;
  const shouldShowEmptyView = status === 'empty' && resultReady;
  const shouldShowErrorView = status === 'error' && resultReady;
  const canStartChat = shouldShowSuccessView && selectedCard !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.headerAction}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문장 질문 카드</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          한 문장을 오래 붙잡을수록 생각은 더 멀리 갑니다. AI가 이 문장에서 이어질 질문을 만들어드릴게요.
        </Text>
        <Text style={styles.subLead}>마음에 드는 질문을 고르면 바로 딥리딩 대화로 이어갈 수 있어요.</Text>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteMeta}>
            {quote.bookTitle} · {quote.author} · P.{quote.pageNumber}
          </Text>
          <Text style={styles.quoteText}>“{quote.quoteText}”</Text>
        </View>

        {status === 'idle' ? (
          <View style={styles.stateBlock}>
            <Text style={styles.stateTitle}>아직 질문을 만들지 않았어요.</Text>
            <Text style={styles.stateBody}>AI가 저장한 문장을 바탕으로 대화를 열기 좋은 질문을 생성합니다.</Text>
          </View>
        ) : null}

        {isLoadingView ? (
          <View style={styles.loadingBlock}>
            <Text style={styles.loadingTitle}>질문을 만들고 있어요</Text>
            <Text style={styles.loadingBody}>문장을 읽고 생각을 확장할 수 있는 질문을 정리하고 있습니다.</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${loadingProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{loadingProgress}%</Text>
          </View>
        ) : null}

        {shouldShowErrorView ? (
          <View style={styles.stateBlock}>
            <Text style={styles.stateTitle}>질문 생성에 실패했어요.</Text>
            <Text style={styles.stateBody}>{errorMessage ?? '잠시 후 다시 시도해주세요.'}</Text>
          </View>
        ) : null}

        {shouldShowEmptyView ? (
          <View style={styles.stateBlock}>
            <Text style={styles.stateTitle}>이번에는 질문이 만들어지지 않았어요.</Text>
            <Text style={styles.stateBody}>문장은 저장되었어요. 다음에 다시 AI 채팅에서 이어서 읽어볼 수 있습니다.</Text>
          </View>
        ) : null}

        {shouldShowSuccessView ? (
          <View style={styles.resultSection}>
            <Text style={styles.resultLead}>대화를 시작할 질문을 하나 골라보세요.</Text>
            <View style={styles.cardList}>
              {cards.map((item) => {
                const isActive = selectedCardId === item.cardId;

                return (
                  <Pressable
                    key={item.id}
                    style={[styles.questionCard, isActive && styles.questionCardActive]}
                    onPress={() => setSelectedCardId(item.cardId)}
                  >
                    <View style={styles.questionCardTop}>
                      <Text style={[styles.questionType, isActive && styles.questionTypeActive]}>{item.intentLabel}</Text>
                      {isActive ? <Text style={styles.selectedLabel}>선택됨</Text> : null}
                    </View>
                    <Text style={styles.questionText}>{item.question}</Text>
                    <Text style={styles.questionGuide}>{item.guide}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        {shouldShowSuccessView ? (
          <>
            <TouchableOpacity style={styles.secondaryButton} onPress={onDone}>
              <Text style={styles.secondaryButtonText}>완료</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, !canStartChat && styles.primaryButtonDisabled]}
              disabled={!canStartChat}
              onPress={() => {
                if (selectedCard) {
                  onStartChat(selectedCard);
                }
              }}
            >
              <Text style={styles.primaryButtonText}>선택한 질문으로 AI와 채팅 시작하기</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.secondaryButton} onPress={onSkip} disabled={isLoadingView}>
              <Text style={styles.secondaryButtonText}>다음에 하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, (!canGenerate || isLoadingView) && styles.primaryButtonDisabled]}
              disabled={!canGenerate || isLoadingView}
              onPress={onGenerate}
            >
              <Text style={styles.primaryButtonText}>{isLoadingView ? '질문 생성 중...' : '질문 생성하기'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ece7df',
    backgroundColor: '#fff',
  },
  headerAction: {
    minWidth: 24,
    fontSize: 18,
    color: '#161412',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    color: '#161412',
    fontWeight: '700',
  },
  headerSpacer: {
    width: 24,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 18,
  },
  lead: {
    fontSize: 22,
    lineHeight: 30,
    color: '#171513',
    fontWeight: '700',
  },
  subLead: {
    marginTop: -8,
    fontSize: 14,
    lineHeight: 21,
    color: '#6b645d',
  },
  quoteCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#f7f3ed',
    gap: 10,
  },
  quoteMeta: {
    fontSize: 12,
    color: '#7a7269',
    fontWeight: '600',
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#181614',
    fontWeight: '600',
  },
  stateBlock: {
    paddingVertical: 6,
    gap: 8,
  },
  stateTitle: {
    fontSize: 17,
    lineHeight: 24,
    color: '#181614',
    fontWeight: '600',
  },
  stateBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6b645d',
  },
  loadingBlock: {
    paddingVertical: 8,
    gap: 12,
  },
  loadingTitle: {
    fontSize: 18,
    lineHeight: 25,
    color: '#181614',
    fontWeight: '600',
  },
  loadingBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6b645d',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#f1ece4',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#f0b84c',
  },
  progressText: {
    fontSize: 13,
    color: '#8d8479',
    fontWeight: '600',
  },
  resultSection: {
    gap: 12,
  },
  resultLead: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4c4640',
  },
  cardList: {
    gap: 12,
  },
  questionCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ece7df',
    backgroundColor: '#fff',
    gap: 10,
  },
  questionCardActive: {
    borderColor: '#181614',
    backgroundColor: '#fbf7ef',
  },
  questionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  questionType: {
    fontSize: 12,
    color: '#7a7269',
    fontWeight: '600',
  },
  questionTypeActive: {
    color: '#181614',
  },
  selectedLabel: {
    fontSize: 11,
    color: '#181614',
    fontWeight: '700',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 27,
    color: '#181614',
    fontWeight: '600',
  },
  questionGuide: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6b645d',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#ece7df',
    backgroundColor: '#fff',
    gap: 10,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f1eb',
  },
  secondaryButtonText: {
    fontSize: 15,
    color: '#514b45',
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181614',
    paddingHorizontal: 16,
  },
  primaryButtonDisabled: {
    backgroundColor: '#b8b0a6',
  },
  primaryButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
});

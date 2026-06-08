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
  const loadingProgressRef = useRef(0);
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

  const animateProgressTo = (
    target: number,
    duration: number,
    onComplete?: () => void,
  ) => {
    clearProgressTimers();
    const current = loadingProgressRef.current;

    if (current === target) {
      if (onComplete) {
        settleTimeoutRef.current = setTimeout(() => {
          settleTimeoutRef.current = null;
          onComplete();
        }, 0);
      }
      return;
    }

    const step = target > current ? 1 : -1;
    const distance = Math.abs(target - current);
    const intervalMs = Math.max(20, Math.round(duration / Math.max(distance, 1)));
    let nextValue = current;

    loadingIntervalRef.current = setInterval(() => {
      nextValue += step;
      const reachedTarget = step > 0 ? nextValue >= target : nextValue <= target;
      const safeValue = reachedTarget ? target : nextValue;
      setLoadingProgress(safeValue);

      if (reachedTarget) {
        clearProgressTimers();
        if (onComplete) {
          settleTimeoutRef.current = setTimeout(() => {
            settleTimeoutRef.current = null;
            onComplete();
          }, 0);
        }
      }
    }, intervalMs);
  };

  useEffect(() => {
    loadingProgressRef.current = loadingProgress;
  }, [loadingProgress]);

  useEffect(() => {
    setSelectedCardId(null);
  }, [quote.quoteId]);

  useEffect(() => {
    if (status === 'loading') {
      const wasLoading = previousStatusRef.current === 'loading';
      previousStatusRef.current = status;

      if (!wasLoading) {
        clearProgressTimers();
        setLoadingProgress(0);
        setResultReady(false);
        animateProgressTo(80, 5000, () => {
          if (previousStatusRef.current !== 'loading') {
            return;
          }

          animateProgressTo(90, 5000);
        });
      }

      return clearProgressTimers;
    }

    if (previousStatusRef.current === 'loading') {
      setResultReady(false);
      const baseProgress = Math.max(loadingProgressRef.current, 90);
      setLoadingProgress(baseProgress);
      animateProgressTo(100, 1000, () => {
        settleTimeoutRef.current = setTimeout(() => {
          settleTimeoutRef.current = null;
          setResultReady(true);
        }, 1000);
      });
    } else {
      clearProgressTimers();
      setResultReady(true);
    }

    previousStatusRef.current = status;

    return clearProgressTimers;
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
        {shouldShowSuccessView ? (
          <TouchableOpacity onPress={onDone} hitSlop={10}>
            <Text style={styles.headerDone}>나가기</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          한 문장을 오래 붙잡을수록 생각은 더 멀리 갑니다. AI가 이 문장에서 이어질 질문을 만들어드릴게요.
        </Text>
        <Text style={styles.subLead}>마음에 드는 질문을 고르면 바로 AI 채팅으로 이어갈 수 있어요.</Text>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteMeta}>
            {quote.bookTitle} · {quote.author} · P.{quote.pageNumber}
          </Text>
          <Text style={styles.quoteText}>“{quote.quoteText}”</Text>
        </View>

        {status === 'idle' ? (
          <View style={styles.stateBlock}>
            <Text style={styles.stateTitle}>질문을 생성해보세요.</Text>
            <Text style={styles.stateBody}>문장을 바탕으로 대화를 시작하기 좋은 질문을 만들 수 있어요.</Text>
          </View>
        ) : null}

        {isLoadingView ? (
          <View style={styles.loadingBlock}>
            <Text style={styles.loadingTitle}>질문을 만들고 있어요</Text>
            <Text style={styles.loadingBody}>문장을 읽고 생각을 확장할 수 있는 질문을 정리하고 있습니다.</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${loadingProgress}%` }]} />
              <Text style={styles.progressText}>{loadingProgress}%</Text>
            </View>
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
  headerDone: {
    minWidth: 24,
    fontSize: 15,
    color: '#44c3f3',
    fontWeight: '700',
    textAlign: 'right',
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
    color: '#66707a',
  },
  quoteCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#fff',
    gap: 10,
    borderWidth: 1,
    borderColor: '#dbe3ea',
  },
  quoteMeta: {
    fontSize: 12,
    color: '#66707a',
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
    color: '#66707a',
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
    color: '#66707a',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#eef3f6',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#f0b84c',
  },
  progressText: {
    fontSize: 13,
    color: '#111',
    fontWeight: '600',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  resultSection: {
    gap: 12,
  },
  resultLead: {
    fontSize: 15,
    lineHeight: 22,
    color: '#66707a',
  },
  cardList: {
    gap: 12,
  },
  questionCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    gap: 10,
  },
  questionCardActive: {
    borderColor: '#111',
    backgroundColor: '#eef8fd',
  },
  questionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  questionType: {
    fontSize: 12,
    color: '#66707a',
    fontWeight: '600',
  },
  questionTypeActive: {
    color: '#111',
  },
  selectedLabel: {
    fontSize: 11,
    color: '#111',
    fontWeight: '700',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 27,
    color: '#111',
    fontWeight: '600',
  },
  questionGuide: {
    fontSize: 13,
    lineHeight: 20,
    color: '#66707a',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#dbe3ea',
    backgroundColor: '#fff',
    gap: 10,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#111',
  },
  secondaryButtonText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181614',
    paddingHorizontal: 16,
  },
  primaryButtonDisabled: {
    backgroundColor: '#8e9aa3',
  },
  primaryButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
});

import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommunityAiTopicSet } from '../model/communityAiTopic.types';

type Props = {
  visible: boolean;
  mode: 'intro' | 'loading';
  status: 'idle' | 'loading' | 'error' | 'empty' | 'success';
  bookTitle: string;
  topicSet: CommunityAiTopicSet | null;
  errorMessage?: string | null;
  selectedSuggestionId: string | null;
  onClose: () => void;
  onGenerate: () => void;
  onSelectSuggestion: (suggestionId: string) => void;
  onUseSelectedSuggestion: () => void;
};

export function CommunityAiDiscussionGenerationModal({
  visible,
  mode,
  status,
  bookTitle,
  topicSet,
  errorMessage,
  selectedSuggestionId,
  onClose,
  onGenerate,
  onSelectSuggestion,
  onUseSelectedSuggestion,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const previousStatusRef = useRef<Props['status']>('idle');
  const progressRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  };

  const animateProgressTo = (target: number, duration: number, onComplete?: () => void) => {
    clearTimers();
    const current = progressRef.current;

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

    intervalRef.current = setInterval(() => {
      nextValue += step;
      const reachedTarget = step > 0 ? nextValue >= target : nextValue <= target;
      const safeValue = reachedTarget ? target : nextValue;
      setProgress(safeValue);

      if (reachedTarget) {
        clearTimers();
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
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!visible) {
      clearTimers();
      setProgress(0);
      setShowResult(false);
      previousStatusRef.current = 'idle';
      return;
    }

    if (mode === 'intro') {
      clearTimers();
      setProgress(0);
      setShowResult(false);
      previousStatusRef.current = 'idle';
      return;
    }

    if (status === 'loading') {
      const wasLoading = previousStatusRef.current === 'loading';
      previousStatusRef.current = status;

      if (!wasLoading) {
        clearTimers();
        setProgress(0);
        setShowResult(false);
        animateProgressTo(80, 5000, () => {
          if (previousStatusRef.current !== 'loading') {
            return;
          }
          animateProgressTo(90, 5000);
        });
      }
      return;
    }

    if (previousStatusRef.current === 'loading') {
      setShowResult(false);
      const baseProgress = Math.max(progressRef.current, 90);
      setProgress(baseProgress);
      animateProgressTo(100, 1000, () => {
        settleTimeoutRef.current = setTimeout(() => {
          settleTimeoutRef.current = null;
          setShowResult(true);
        }, 1000);
      });
    } else if (status === 'success' || status === 'empty' || status === 'error') {
      if (status === 'success') {
        setShowResult(true);
        setProgress(100);
      } else {
        clearTimers();
        setShowResult(true);
        setProgress(100);
      }
    }

    previousStatusRef.current = status;
  }, [mode, status, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheetWrap}>
          <Pressable style={[styles.card, mode === 'loading' ? styles.cardLoading : null]} onPress={() => undefined}>
            {mode === 'intro' ? (
              <>
                <Text style={styles.eyebrow}>AI DISCUSSION CONTENT</Text>
                <Text style={styles.title}>{bookTitle} 토론에 바로 쓸 수 있는 초안을 추천해요</Text>
                <Text style={styles.body}>
                  {'• 책의 흐름을 바탕으로 토론 제목과 내용을 추천해요\n'}
                  {'• 카드 중 하나를 고르면 토론 작성 화면에 바로 들어가요\n'}
                  {'• 필요한 문장은 직접 다듬어서 완성할 수 있어요'}
                </Text>
                <TouchableOpacity style={styles.generateButton} onPress={onGenerate}>
                  <Text style={styles.generateButtonText}>AI 토론 콘텐츠 생성</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {mode === 'loading' && !showResult ? (
              <View style={styles.loadingWrap}>
                <Text style={styles.title}>
                  {status === 'error'
                    ? '토론 초안을 다시\n정리하고 있어요'
                    : 'AI가 토론 제목과 내용을\n정리하고 있어요'}
                </Text>
                <Text style={styles.loadingText}>
                  책에서 뽑은 흐름을 바탕으로{"\n"}
                  가장 자연스러운 초안을 찾는 중입니다.
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  <Text style={styles.progressText}>{progress}%</Text>
                </View>
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              </View>
            ) : null}

            {mode === 'loading' && showResult && status === 'error' ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>토론 초안 생성에 실패했어요.</Text>
                <Text style={styles.stateBody}>{errorMessage ?? '다시 시도해보세요.'}</Text>
              </View>
            ) : null}

            {mode === 'loading' && showResult && status === 'empty' ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>추천할 토론 초안이 아직 없어요.</Text>
                <Text style={styles.stateBody}>응답은 정상적으로 왔지만 보여줄 카드가 비어 있어요.</Text>
              </View>
            ) : null}

            {mode === 'loading' && showResult && status === 'success' && topicSet ? (
              <>
                <View style={styles.summaryCard}>
                  <Text style={styles.sectionLabel}>추천 기준</Text>
                  <Text style={styles.summaryText}>{topicSet.topics.length}개의 토론 초안을 준비했어요</Text>
                  {topicSet.featuredQuote ? (
                    <Text style={styles.summaryBody}>대표 문장: “{topicSet.featuredQuote.quoteText}”</Text>
                  ) : null}
                </View>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.cardList}>
                    {topicSet.topics.map((topic) => {
                      const isActive = selectedSuggestionId === topic.id;
                      return (
                        <TouchableOpacity
                          key={topic.id}
                          style={[styles.topicCard, isActive && styles.topicCardActive]}
                          onPress={() => onSelectSuggestion(topic.id)}
                        >
                          <View style={styles.topicHeader}>
                            <Text style={[styles.topicIndex, isActive && styles.topicIndexActive]}>
                              {String(topic.displayOrder).padStart(2, '0')}
                            </Text>
                            <Text style={styles.topicTitle}>{topic.title}</Text>
                          </View>
                          <Text style={styles.topicDescription}>{topic.description}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.useButton, !selectedSuggestionId && styles.useButtonDisabled]}
                  disabled={!selectedSuggestionId}
                  onPress={onUseSelectedSuggestion}
                >
                  <Text style={styles.useButtonText}>선택한 카드로 토론 작성하기</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </Pressable>

          <TouchableOpacity style={styles.closeOutsideButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    justifyContent: 'center',
    paddingHorizontal: 34,
    paddingVertical: 36,
  },
  sheetWrap: {
    alignItems: 'center',
    width: '100%',
    flex: 0,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#44c3f3',
    padding: 18,
    maxWidth: 360,
    maxHeight: '86%',
    gap: 12,
  },
  cardLoading: {
    marginVertical: 28,
    maxWidth: 320,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  eyebrow: { fontSize: 10, color: '#66707a', fontWeight: '900', letterSpacing: 0.8 },
  title: { fontSize: 20, lineHeight: 27, color: '#111', fontWeight: '900' },
  body: { fontSize: 12, lineHeight: 18, color: '#66707a' },
  generateButton: {
    minHeight: 44,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  generateButtonText: { fontSize: 13, color: '#44c3f3', fontWeight: '900' },
  loadingWrap: { gap: 12 },
  loadingText: { color: '#66707a', fontSize: 12, lineHeight: 18 },
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
    backgroundColor: '#44c3f3',
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
  errorText: { color: '#cf4f4f', fontSize: 12, lineHeight: 18 },
  stateCard: {
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    padding: 14,
    gap: 8,
  },
  stateTitle: { fontSize: 16, lineHeight: 22, color: '#171512', fontWeight: '900' },
  stateBody: { fontSize: 12, lineHeight: 18, color: '#66707a' },
  summaryCard: {
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 14,
    gap: 8,
  },
  sectionLabel: { fontSize: 11, color: '#111', fontWeight: '900' },
  summaryText: { fontSize: 14, lineHeight: 21, color: '#171512', fontWeight: '800' },
  summaryBody: { fontSize: 12, lineHeight: 18, color: '#66707a' },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingBottom: 4 },
  cardList: { gap: 10 },
  topicCard: {
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 14,
    gap: 10,
  },
  topicCardActive: {
    backgroundColor: '#eef8fd',
    borderColor: '#44c3f3',
  },
  topicHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topicIndex: {
    fontSize: 11,
    color: '#111',
    fontWeight: '900',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 7,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  topicIndexActive: {
    backgroundColor: '#111',
    color: '#44c3f3',
  },
  topicTitle: { flex: 1, fontSize: 16, color: '#171512', fontWeight: '900' },
  topicDescription: { fontSize: 12, lineHeight: 19, color: '#66707a' },
  useButton: {
    minHeight: 44,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  useButtonDisabled: { opacity: 0.55 },
  useButtonText: { fontSize: 13, color: '#111', fontWeight: '900' },
  closeOutsideButton: {
    marginTop: 14,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: { color: '#111', fontSize: 12, fontWeight: '800' },
});

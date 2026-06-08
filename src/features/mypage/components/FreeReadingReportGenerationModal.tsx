import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FreeReadingReportResult } from '../model/freeReadingReport.types';
import { FreeReadingReportResultView } from './FreeReadingReportResultView';
import { BookshelfLoader } from '../../../shared/ui/BookshelfLoader';

type Props = {
  visible: boolean;
  mode: 'intro' | 'active';
  status: 'idle' | 'loading' | 'error' | 'success';
  report: FreeReadingReportResult | null;
  canGenerate?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onStartGenerate: () => void;
};

export function FreeReadingReportGenerationModal({
  visible,
  mode,
  status,
  report,
  canGenerate = true,
  errorMessage,
  onClose,
  onStartGenerate,
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
        setShowResult(true);
      });
    } else if (status === 'success') {
      setShowResult(true);
      setProgress(100);
    } else if (status === 'error') {
      clearTimers();
      setShowResult(false);
    }

    previousStatusRef.current = status;
  }, [status, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheetWrap}>
          <Pressable style={styles.card} onPress={() => undefined}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.eyebrow}>READING REPORT</Text>
                <Text style={styles.title}>
                  {mode === 'intro'
                    ? '내 독서 성향을 더 깊게 살펴볼까요?'
                    : showResult
                      ? '독서 리포트 결과 확인하기'
                      : '독서 리포트를 정리하고 있어요'}
                </Text>
              </View>
            </View>

            {mode === 'intro' ? (
              <View style={styles.introWrap}>
                <Text style={styles.introText}>
                  {'• 나의 독서 흐름을 정리해서 보여줘요\n'}
                  {'• 자주 드러나는 감정과 생각의 방향을 읽어드려요\n'}
                  {'• 이전 기록과 비교해 달라진 점을 확인할 수 있어요\n'}
                  {'• 다음에 어떤 책과 방향이 잘 맞는지도 참고할 수 있어요'}
                </Text>
                {canGenerate ? (
                  <TouchableOpacity style={styles.startButton} onPress={onStartGenerate}>
                    <Text style={styles.startButtonText}>무료로 리포트 생성하기</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.insufficientWrap}>
                    <Text style={styles.insufficientTitle}>아직 리포트를 만들기엔 기록이 부족해요.</Text>
                    <Text style={styles.insufficientBody}>
                      문장 저장이 더 쌓이면 지금의 독서 흐름을 더 정확하게 정리할 수 있어요.
                    </Text>
                  </View>
                )}
              </View>
            ) : null}

            {mode !== 'intro' && !showResult && canGenerate ? (
              <View style={styles.loadingWrap}>
                <Text style={styles.loadingText}>
                  {status === 'error' ? '리포트를 다시 정리하는 중입니다.' : '당신에게 맞는 리포트를 준비하는 중입니다.'}
                </Text>
                <View style={styles.loaderWrap}>
                  <BookshelfLoader width={280} />
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  <Text style={styles.progressText}>{progress}%</Text>
                </View>
              </View>
            ) : null}

            {mode !== 'intro' && !showResult && !canGenerate ? (
              <View style={styles.insufficientWrap}>
                <Text style={styles.insufficientTitle}>아직 리포트를 만들기엔 기록이 부족해요.</Text>
                <Text style={styles.insufficientBody}>
                  문장 저장이 더 쌓이면 지금의 독서 흐름을 더 정확하게 정리할 수 있어요.
                </Text>
              </View>
            ) : null}

            {mode !== 'intro' && status === 'error' ? <Text style={styles.errorText}>{errorMessage ?? '리포트를 불러오지 못했어요.'}</Text> : null}

            {mode !== 'intro' && showResult && report ? (
              <ScrollView
                style={styles.resultScroll}
                contentContainerStyle={styles.resultScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.resultWrap}>
                  <FreeReadingReportResultView report={report} />
                </View>
              </ScrollView>
            ) : null}
          </Pressable>

          <View style={styles.footerDock}>
            <TouchableOpacity style={styles.closeOutsideButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 18,
  },
  sheetWrap: {
    alignItems: 'center',
    width: '100%',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#44c3f3',
    padding: 16,
    maxHeight: '86%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  headerTextWrap: { flex: 1 },
  eyebrow: { fontSize: 10, color: '#66707a', fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  title: { fontSize: 20, lineHeight: 27, color: '#111', fontWeight: '900' },
  closeButton: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  closeButtonText: { color: '#111', fontSize: 12, fontWeight: '800' },
  closeOutsideButton: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  footerDock: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 18,
    marginBottom: 8,
  },
  loadingWrap: { gap: 12, marginBottom: 8 },
  loaderWrap: { alignItems: 'center', marginTop: 2, marginBottom: 2 },
  loadingText: { color: '#66707a', fontSize: 12, lineHeight: 18 },
  resultScroll: { flex: 1 },
  resultScrollContent: { paddingBottom: 4 },
  introWrap: { gap: 14, marginBottom: 8 },
  introText: { color: '#66707a', fontSize: 12, lineHeight: 18 },
  insufficientWrap: {
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    padding: 12,
    gap: 6,
  },
  insufficientTitle: { color: '#111', fontSize: 13, fontWeight: '800' },
  insufficientBody: { color: '#66707a', fontSize: 12, lineHeight: 18 },
  startButton: {
    minHeight: 44,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  startButtonText: { fontSize: 13, color: '#44c3f3', fontWeight: '900' },
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
  errorText: { color: '#cf4f4f', fontSize: 12, marginBottom: 8 },
  resultWrap: { flex: 1 },
});

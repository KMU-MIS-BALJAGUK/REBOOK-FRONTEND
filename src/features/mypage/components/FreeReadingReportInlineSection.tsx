import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FreeReadingReportListResult } from '../model/freeReadingReportList.types';
import { FreeReadingReportResult } from '../model/freeReadingReport.types';
import { FreeReadingReportResultView } from './FreeReadingReportResultView';
import { formatChatMessageAt } from '../../../shared/utils/formatChatMessageAt';

type Props = {
  mode: 'intro' | 'loading' | 'list' | 'result';
  status: 'idle' | 'loading' | 'error' | 'success';
  report: FreeReadingReportResult | null;
  reportList: FreeReadingReportListResult | null;
  canGenerate: boolean;
  connected?: boolean;
  errorMessage?: string | null;
  listErrorMessage?: string | null;
  onStartGenerate: () => void;
  onSelectReport: (reportId: number) => void;
  onClose: () => void;
};

export function FreeReadingReportInlineSection({
  mode,
  status,
  report,
  reportList,
  canGenerate,
  connected = false,
  errorMessage,
  listErrorMessage,
  onStartGenerate,
  onSelectReport,
  onClose,
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
    if (mode !== 'loading') {
      clearTimers();
      if (mode !== 'result') {
        setProgress(0);
        setShowResult(false);
      }
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
    } else if (status === 'success') {
      setShowResult(true);
      setProgress(100);
    } else if (status === 'error') {
      clearTimers();
      setShowResult(false);
    }

    previousStatusRef.current = status;
  }, [mode, status]);

  if (mode === 'intro') {
    return (
      <View style={[styles.wrap, connected ? styles.wrapConnected : null]}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>READING REPORT</Text>
          <Text style={styles.title}>내 독서 성향을 더 깊게 살펴볼까요?</Text>
          <Text style={styles.introText}>
            {'• 나의 독서 흐름을 정리해서 보여줘요\n'}
            {'• 자주 드러나는 감정과 생각의 방향을 읽어드려요\n'}
            {'• 이전 기록과 비교해 달라진 점을 확인할 수 있어요\n'}
            {'• 다음에 어떤 책과 방향이 잘 맞는지도 참고할 수 있어요'}
          </Text>
          {canGenerate ? (
            <TouchableOpacity style={styles.primaryButton} onPress={onStartGenerate}>
              <Text style={styles.primaryButtonText}>무료로 리포트 생성하기</Text>
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
      </View>
    );
  }

  if (mode === 'loading') {
    return (
      <View style={[styles.wrap, connected ? styles.wrapConnected : null]}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>READING REPORT</Text>
          <Text style={styles.title}>{status === 'error' ? '리포트를 다시 정리하는 중입니다.' : '독서 리포트를 정리하고 있어요'}</Text>
          <Text style={styles.loadingText}>당신에게 맞는 리포트를 준비하는 중입니다.</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (mode === 'list') {
    return (
      <View style={[styles.wrap, connected ? styles.wrapConnected : null]}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>READING REPORT</Text>
          <Text style={styles.title}>이전 독서 리포트</Text>
          <Text style={styles.listIntro}>
            {'• 이전에 받은 리포트를 시기별로 다시 열어볼 수 있어요\n'}
            {'• 비슷한 흐름이 있었는지, 어떻게 달라졌는지 비교해볼 수 있어요\n'}
            {'• 마음에 드는 리포트는 다시 열어 상세하게 확인할 수 있어요'}
          </Text>

          {listErrorMessage ? <Text style={styles.errorText}>{listErrorMessage}</Text> : null}

          {!listErrorMessage && reportList && reportList.items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>아직 이전 리포트가 없어요.</Text>
              <Text style={styles.emptyBody}>독서 리포트를 만들면, 나의 흐름이 쌓인 기록을 여기서 다시 열어볼 수 있어요.</Text>
            </View>
          ) : null}

          {reportList?.items.map((item) => (
            <TouchableOpacity key={item.reportId} style={styles.listItem} onPress={() => onSelectReport(item.reportId)}>
              <View style={styles.listItemTop}>
                <Text style={styles.listPeriod}>{item.reportPeriod}</Text>
              </View>
              <View style={styles.listMetaRow}>
                <Text style={styles.listMeta}>정리 시각</Text>
                <Text style={styles.listMeta}>{item.generatedAt ? formatChatMessageAt(item.generatedAt) : '아직 정리 중'}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  }

  if (mode === 'result' && report) {
    return (
      <View style={[styles.wrap, connected ? styles.wrapConnected : null]}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>READING REPORT</Text>
          <Text style={styles.title}>독서 리포트 결과 확인하기</Text>
          <FreeReadingReportResultView report={report} />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, marginBottom: 12 },
  wrapConnected: { marginTop: 0 },
  card: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#fff',
    padding: 16,
    gap: 10,
  },
  eyebrow: { fontSize: 10, color: '#66707a', fontWeight: '900', letterSpacing: 0.8 },
  title: { fontSize: 18, lineHeight: 25, color: '#111', fontWeight: '900' },
  introText: { fontSize: 12, lineHeight: 18, color: '#66707a' },
  listIntro: { fontSize: 12, lineHeight: 18, color: '#66707a' },
  primaryButton: {
    minHeight: 44,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryButtonText: { fontSize: 13, color: '#44c3f3', fontWeight: '900' },
  insufficientWrap: {
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    padding: 12,
    gap: 6,
  },
  insufficientTitle: { color: '#111', fontSize: 13, fontWeight: '800' },
  insufficientBody: { color: '#66707a', fontSize: 12, lineHeight: 18 },
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
  errorText: { color: '#cf4f4f', fontSize: 12, lineHeight: 18 },
  emptyState: {
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: { fontSize: 15, color: '#111', fontWeight: '800' },
  emptyBody: { fontSize: 12, color: '#66707a', lineHeight: 18, textAlign: 'center' },
  listItem: {
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    padding: 12,
    gap: 6,
  },
  listItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listPeriod: { flex: 1, fontSize: 14, color: '#111', fontWeight: '800' },
  listMetaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  listMeta: { fontSize: 10, color: '#66707a' },
  closeButton: {
    alignSelf: 'center',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
  },
  closeButtonText: { color: '#111', fontSize: 12, fontWeight: '800' },
});

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onOpenAnalysis: () => void;
  onOpenList: () => void;
  activeMode?: 'analysis' | 'list' | null;
};

export function FreeReadingReportPanel({ onOpenAnalysis, onOpenList, activeMode = null }: Props) {
  const isAnalysisActive = activeMode === 'analysis';
  const isListActive = activeMode === 'list';

  return (
    <View style={[styles.wrap, activeMode ? styles.wrapConnected : null]}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>READING REPORT</Text>
        <Text style={styles.title}>독서 리포트</Text>
        <Text style={styles.body}>
          {'• 지금의 독서 흐름을 한눈에 정리해요\n'}
          {'• 내 감정과 키워드를 묶어 현재 상태를 보여줘요\n'}
          {'• 이전 리포트와 비교하며 변화의 방향을 읽어낼 수 있어요'}
        </Text>
        <View style={styles.quickButtonRow}>
          <TouchableOpacity
            style={[styles.quickButton, isAnalysisActive ? styles.quickButtonActive : null]}
            onPress={onOpenAnalysis}
          >
            <Text style={[styles.quickButtonText, isAnalysisActive ? styles.quickButtonTextActive : null]}>
              내 독서 성향 분석하기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickButton, isListActive ? styles.quickButtonActive : null]} onPress={onOpenList}>
            <Text style={[styles.quickButtonText, isListActive ? styles.quickButtonTextActive : null]}>목록보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, marginTop: 18, marginBottom: 18 },
  wrapConnected: { marginBottom: 0 },
  hero: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#44c3f3',
    padding: 14,
    gap: 8,
  },
  eyebrow: { fontSize: 10, color: '#111', fontWeight: '900', letterSpacing: 0.8 },
  title: { fontSize: 20, lineHeight: 27, color: '#111', fontWeight: '900' },
  body: { fontSize: 12, lineHeight: 18, color: '#1d1d1d' },
  quickButtonRow: { flexDirection: 'row', gap: 8 },
  quickButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  quickButtonActive: {
    backgroundColor: '#111',
    borderColor: '#111',
    borderBottomWidth: 0,
    marginBottom: -1,
    zIndex: 2,
    transform: [{ translateY: 1 }],
  },
  quickButtonText: { fontSize: 12, color: '#111', fontWeight: '800' },
  quickButtonTextActive: { color: '#44c3f3' },
});

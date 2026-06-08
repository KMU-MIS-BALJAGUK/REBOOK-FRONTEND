import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onOpenAnalysis: () => void;
  onOpenList: () => void;
};

export function FreeReadingReportPanel({ onOpenAnalysis, onOpenList }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>FREE READING REPORT</Text>
        <Text style={styles.title}>무료 독서 리포트</Text>
        <Text style={styles.body}>
          {'• 지금의 독서 흐름을 한눈에 정리해요\n'}
          {'• 내 감정과 키워드를 묶어 현재 상태를 보여줘요\n'}
          {'• 이전 리포트와 비교하며 변화의 방향을 읽어낼 수 있어요'}
        </Text>
        <View style={styles.quickButtonRow}>
          <TouchableOpacity style={styles.quickButton} onPress={onOpenAnalysis}>
            <Text style={styles.quickButtonText}>내 독서 성향 분석하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton} onPress={onOpenList}>
            <Text style={styles.quickButtonText}>목록보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, marginTop: 18, marginBottom: 18 },
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
  quickButtonText: { fontSize: 12, color: '#111', fontWeight: '800' },
});

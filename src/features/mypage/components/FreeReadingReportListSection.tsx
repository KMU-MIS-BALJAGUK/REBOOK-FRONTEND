import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FreeReadingReportListResult } from '../model/freeReadingReportList.types';
import { formatChatMessageAt } from '../../../shared/utils/formatChatMessageAt';

type Props = {
  reportList: FreeReadingReportListResult | null;
  isLoading: boolean;
  errorMessage?: string | null;
  connected?: boolean;
  onSelectReport: (reportId: number) => void;
};

export function FreeReadingReportListSection({ reportList, isLoading, errorMessage, connected = false, onSelectReport }: Props) {
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [reportList]);

  const visibleItems = useMemo(() => {
    if (!reportList) {
      return [];
    }

    return showAll ? reportList.items : reportList.items.slice(0, 3);
  }, [reportList, showAll]);

  return (
    <View style={[styles.wrap, connected ? styles.wrapConnected : null]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>READING REPORT</Text>
        <Text style={styles.title}>독서 리포트 목록</Text>
        <Text style={styles.description}>
          {'• 이전에 받은 리포트를 시기별로 다시 열어볼 수 있어요\n'}
          {'• 비슷한 흐름이 있었는지, 어떻게 달라졌는지 비교해볼 수 있어요\n'}
          {'• 마음에 드는 리포트는 다시 열어 상세하게 확인할 수 있어요'}
        </Text>
      </View>

      {isLoading ? <Text style={styles.stateText}>리포트 목록을 불러오는 중...</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {!isLoading && !errorMessage && reportList && reportList.items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>아직 이전 리포트가 없어요.</Text>
          <Text style={styles.emptyBody}>독서 리포트를 만들면, 나의 흐름이 쌓인 기록을 여기서 다시 열어볼 수 있어요.</Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage && reportList
        ? visibleItems.map((item) => (
            <TouchableOpacity key={item.reportId} style={styles.listItem} onPress={() => onSelectReport(item.reportId)}>
              <View style={styles.listItemTop}>
                <Text style={styles.listPeriod}>{item.reportPeriod}</Text>
              </View>
              <View style={styles.listMetaRow}>
                <Text style={styles.listMeta}>정리 시각</Text>
                <Text style={styles.listMeta}>{item.generatedAt ? formatChatMessageAt(item.generatedAt) : '아직 정리 중'}</Text>
              </View>
            </TouchableOpacity>
          ))
        : null}

      {!isLoading && !errorMessage && reportList && reportList.items.length > 3 ? (
        <TouchableOpacity style={styles.moreButton} onPress={() => setShowAll((prev) => !prev)}>
          <Text style={styles.moreButtonText}>{showAll ? '접기' : '더보기'}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#fff',
    padding: 14,
    gap: 10,
    marginTop: 18,
    marginBottom: 4,
  },
  wrapConnected: { marginTop: 0 },
  header: { gap: 6 },
  eyebrow: { fontSize: 10, color: '#66707a', fontWeight: '900', letterSpacing: 0.8 },
  title: { fontSize: 18, lineHeight: 25, color: '#111', fontWeight: '900' },
  description: { fontSize: 12, lineHeight: 18, color: '#66707a' },
  stateText: { color: '#66707a', fontSize: 12 },
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
  moreButton: {
    alignSelf: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  moreButtonText: { color: '#111', fontSize: 12, fontWeight: '800' },
});

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FreeReadingReportListResult } from '../model/freeReadingReportList.types';

type Props = {
  visible: boolean;
  reportList: FreeReadingReportListResult | null;
  isLoading: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSelectReport: (reportId: number) => void;
};

export function FreeReadingReportListModal({
  visible,
  reportList,
  isLoading,
  errorMessage,
  onClose,
  onSelectReport,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheetWrap}>
          <Pressable style={styles.card} onPress={() => undefined}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.eyebrow}>FREE READING REPORT</Text>
                <Text style={styles.title}>이전 무료 독서 리포트</Text>
              </View>
            </View>
            <Text style={styles.description}>
              {'• 이전에 받은 리포트를 시기별로 다시 열어볼 수 있어요\n'}
              {'• 비슷한 흐름이 있었는지, 어떻게 달라졌는지 비교해볼 수 있어요\n'}
              {'• 마음에 드는 리포트는 다시 열어 상세하게 확인할 수 있어요'}
            </Text>

            {isLoading ? <Text style={styles.stateText}>리포트 목록을 불러오는 중...</Text> : null}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {!isLoading && !errorMessage && reportList && reportList.items.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>아직 이전 리포트가 없어요.</Text>
                <Text style={styles.emptyBody}>무료 독서 리포트를 만들면, 나의 흐름이 쌓인 기록을 여기서 다시 열어볼 수 있어요.</Text>
              </View>
            ) : null}

            <ScrollView style={styles.listWrap} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              {reportList?.items.map((item) => (
                <TouchableOpacity key={item.reportId} style={styles.listItem} onPress={() => onSelectReport(item.reportId)}>
                  <View style={styles.listItemTop}>
                    <Text style={styles.listPeriod}>{item.reportPeriod}</Text>
                    <Text style={styles.listStatus}>{item.status}</Text>
                  </View>
                  <View style={styles.listMetaRow}>
                    <Text style={styles.listMeta}>정리 시각</Text>
                    <Text style={styles.listMeta}>{item.generatedAt ?? '아직 정리 중'}</Text>
                  </View>
                  <Text style={styles.listStatusMeta}>{item.lastRunStatus ?? '아직 완성 중'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    marginBottom: 8,
  },
  headerTextWrap: { flex: 1 },
  eyebrow: { fontSize: 10, color: '#66707a', fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  title: { fontSize: 20, lineHeight: 27, color: '#111', fontWeight: '900' },
  description: { fontSize: 12, lineHeight: 18, color: '#66707a', marginBottom: 14 },
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
  stateText: { color: '#66707a', fontSize: 12, marginBottom: 8 },
  errorText: { color: '#cf4f4f', fontSize: 12, marginBottom: 8 },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: { fontSize: 15, color: '#111', fontWeight: '800' },
  emptyBody: { fontSize: 12, color: '#66707a', lineHeight: 18, textAlign: 'center' },
  listWrap: { flexGrow: 0 },
  listContent: { gap: 10, paddingBottom: 4 },
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
  listStatus: { fontSize: 11, color: '#44c3f3', fontWeight: '800' },
  listMetaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  listMeta: { fontSize: 10, color: '#66707a' },
  listStatusMeta: { fontSize: 10, color: '#66707a' },
});

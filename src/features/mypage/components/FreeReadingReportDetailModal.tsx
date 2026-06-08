import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFreeReadingReport } from '../hooks/useFreeReadingReport';
import { FreeReadingReportResultView } from './FreeReadingReportResultView';

type Props = {
  visible: boolean;
  reportId: number | null;
  onClose: () => void;
};

export function FreeReadingReportDetailModal({ visible, reportId, onClose }: Props) {
  const reportQuery = useFreeReadingReport({
    reportId,
    enabled: visible && reportId !== null,
  });
  const report = reportQuery.data ?? null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.eyebrow}>FREE READING REPORT</Text>
              <Text style={styles.title}>무료 독서 리포트 상세보기</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>

          {reportQuery.isLoading ? <Text style={styles.stateText}>리포트를 불러오는 중...</Text> : null}
          {reportQuery.isError ? <Text style={styles.errorText}>리포트를 불러오지 못했어요.</Text> : null}

          {!reportQuery.isLoading && !reportQuery.isError && report ? (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <FreeReadingReportResultView report={report} />
            </ScrollView>
          ) : null}
        </Pressable>
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
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#44c3f3',
    padding: 16,
    maxHeight: '86%',
  },
  handle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#44c3f3',
    marginBottom: 12,
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
  closeButton: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  closeButtonText: { color: '#111', fontSize: 12, fontWeight: '800' },
  stateText: { color: '#66707a', fontSize: 12, marginBottom: 8 },
  errorText: { color: '#cf4f4f', fontSize: 12, marginBottom: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 4 },
});

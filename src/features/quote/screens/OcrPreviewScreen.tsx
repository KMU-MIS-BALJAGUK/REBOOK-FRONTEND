import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OCR_SAMPLE_LINES } from '../model/mockData';
import { QuoteOcrBlock } from '../model/quoteOcr.types';

type Props = {
  onBack: () => void;
  onNext: () => void;
  blocks?: QuoteOcrBlock[];
};

export function OcrPreviewScreen({ onBack, onNext, blocks }: Props) {
  const displayBlocks = blocks && blocks.length > 0 ? blocks : OCR_SAMPLE_LINES.map((text, index) => ({
    blockId: index + 1,
    text,
    selected: index === 1,
    bbox: { x: 0, y: 0, width: 1, height: 0.1 },
  }));

  return (
    <SafeAreaView style={styles.formSafeArea}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>기록할 문장을 드래그해서 선택해주세요</Text>
        <View style={styles.formHeaderRight} />
      </View>
      <View style={styles.ocrCard}>
        {displayBlocks.map((block) => (
          <Text key={block.blockId} style={block.selected ? styles.ocrTextHighlight : styles.ocrTextMuted}>
            {block.text}
          </Text>
        ))}
      </View>
      <TouchableOpacity style={styles.ocrNextButton} onPress={onNext}>
        <Text style={styles.ocrNextText}>다음</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  formSafeArea: { flex: 1, backgroundColor: '#f6f3ee' },
  formHeader: {
    height: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: { fontSize: 18, color: '#453d33' },
  formHeaderTitle: { fontSize: 14, color: '#3a3228', fontWeight: '600' },
  formHeaderRight: { width: 18 },
  ocrCard: {
    flex: 1,
    marginHorizontal: 14,
    marginTop: 8,
    backgroundColor: '#fbf8f2',
    borderWidth: 1,
    borderColor: '#e9dfd0',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  ocrTextMuted: { fontSize: 12, color: '#72695e', lineHeight: 18 },
  ocrTextHighlight: {
    fontSize: 12,
    color: '#3f3a30',
    lineHeight: 18,
    backgroundColor: 'rgba(163, 216, 146, 0.55)',
    paddingVertical: 3,
  },
  ocrNextButton: {
    height: 44,
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 9,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ocrNextText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

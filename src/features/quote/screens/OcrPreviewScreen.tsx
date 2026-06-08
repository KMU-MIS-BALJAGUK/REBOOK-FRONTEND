import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  NativeSyntheticEvent,
  PanResponder,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { OCR_SAMPLE_LINES } from '../model/mockData';
import type { QuoteOcrBlock } from '../model/quoteOcr.types';

type Props = {
  onBack: () => void;
  onNext: (selectedText: string, blockIds: number[]) => void;
  blocks?: QuoteOcrBlock[];
  text?: string;
};

type TextRange = {
  start: number;
  end: number;
};

type OcrTextBlockRange = TextRange & {
  blockId: number;
};

function buildOcrText(blocks: QuoteOcrBlock[], originalText?: string) {
  if (originalText) {
    const blockRanges: OcrTextBlockRange[] = [];
    let searchStart = 0;

    blocks.forEach((block) => {
      const start = originalText.indexOf(block.text, searchStart);
      if (start < 0) {
        return;
      }

      const end = start + block.text.length;
      blockRanges.push({ blockId: block.blockId, start, end });
      searchStart = end;
    });

    return { fullText: originalText, blockRanges };
  }

  const blockRanges: OcrTextBlockRange[] = [];
  let fullText = '';

  blocks.forEach((block, index) => {
    if (index > 0) {
      fullText += '\n';
    }

    const start = fullText.length;
    fullText += block.text;
    blockRanges.push({
      blockId: block.blockId,
      start,
      end: fullText.length,
    });
  });

  return { fullText, blockRanges };
}

function findOverlappingBlockIds(selection: TextRange, blockRanges: OcrTextBlockRange[]) {
  if (selection.start === selection.end) {
    return [];
  }

  return blockRanges
    .filter((blockRange) => selection.start < blockRange.end && selection.end > blockRange.start)
    .map((blockRange) => blockRange.blockId);
}

export function OcrPreviewScreen({ onBack, onNext, blocks, text }: Props) {
  const displayBlocks = useMemo(
    () =>
      blocks ??
      OCR_SAMPLE_LINES.map((text, index) => ({
        blockId: index + 1,
        text,
        selected: false,
        bbox: { x: 0, y: 0, width: 1, height: 0.1 },
      })),
    [blocks],
  );
  const { fullText, blockRanges } = useMemo(() => buildOcrText(displayBlocks, text), [displayBlocks, text]);
  const textInputRef = useRef<TextInput | null>(null);
  const edgeSwipeTranslateX = useRef(new Animated.Value(0)).current;
  const edgeSwipeStartX = useRef(0);
  const edgeSwipeAnimating = useRef(false);
  const [editableText, setEditableText] = useState(fullText);
  const [selection, setSelection] = useState<TextRange>({ start: 0, end: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const isEdited = editableText !== fullText;
  const selectedText = editableText.slice(selection.start, selection.end);
  const selectedBlockIds = isEdited ? [] : findOverlappingBlockIds(selection, blockRanges);
  const hasSelection = selectedText.trim().length > 0;

  useEffect(() => {
    setEditableText(fullText);
    setSelection({ start: 0, end: 0 });
  }, [fullText]);

  const handleSelectionChange = (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    setSelection(event.nativeEvent.selection);
  };

  const handleTextChange = (nextText: string) => {
    setEditableText(nextText);
    setSelection((current) => ({
      start: Math.min(current.start, nextText.length),
      end: Math.min(current.end, nextText.length),
    }));
  };

  const startEditing = () => {
    setIsEditing(true);
    requestAnimationFrame(() => {
      textInputRef.current?.focus();
    });
  };

  const finishEditing = () => {
    textInputRef.current?.blur();
    Keyboard.dismiss();
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      finishEditing();
      return;
    }

    startEditing();
  };

  const resetEdgeSwipe = () => {
    Animated.spring(edgeSwipeTranslateX, {
      toValue: 0,
      friction: 9,
      tension: 80,
      useNativeDriver: true,
    }).start(() => {
      edgeSwipeAnimating.current = false;
    });
  };

  const dismissEdgeSwipe = () => {
    edgeSwipeAnimating.current = true;
    Keyboard.dismiss();
    Animated.timing(edgeSwipeTranslateX, {
      toValue: 110,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      edgeSwipeAnimating.current = false;
      edgeSwipeTranslateX.setValue(0);
      onBack();
    });
  };

  const edgeSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_, gestureState) => gestureState.x0 <= 28 && !edgeSwipeAnimating.current,
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          if (edgeSwipeAnimating.current) {
            return false;
          }
          if (gestureState.x0 > 28) {
            return false;
          }

          const absDx = Math.abs(gestureState.dx);
          const absDy = Math.abs(gestureState.dy);
          return gestureState.dx > 8 && absDx > absDy * 1.08;
        },
        onPanResponderGrant: () => {
          edgeSwipeTranslateX.stopAnimation((value) => {
            edgeSwipeStartX.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const next = Math.max(0, edgeSwipeStartX.current + gestureState.dx);
          edgeSwipeTranslateX.setValue(Math.min(next, 110));
        },
        onPanResponderRelease: (_, gestureState) => {
          const threshold = 110 * 0.2;
          if (gestureState.dx >= threshold) {
            dismissEdgeSwipe();
            return;
          }
          resetEdgeSwipe();
        },
        onPanResponderTerminate: () => {
          resetEdgeSwipe();
        },
      }),
    [edgeSwipeTranslateX],
  );

  return (
    <Animated.View style={[styles.screen, { transform: [{ translateX: edgeSwipeTranslateX }] }]}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brandTitle}>ReBook</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>기록할 문장을 선택해주세요</Text>
          <Text style={styles.description}>잘못 인식된 글자를 수정한 뒤, 원하는 부분을 길게 눌러 선택해주세요.</Text>

          <View style={styles.selectionSummary}>
            <Text style={styles.selectionSummaryLabel}>선택한 문장</Text>
            <Text style={[styles.selectionSummaryText, !hasSelection && styles.selectionSummaryPlaceholder]} numberOfLines={3}>
              {hasSelection ? selectedText.trim() : '텍스트에서 원하는 부분을 길게 눌러 선택하세요.'}
            </Text>
          </View>

          <View style={styles.textCard}>
            <View style={styles.textCardHeader}>
              <Text style={styles.textCardHeaderLabel}>인식된 텍스트</Text>
              <TouchableOpacity style={styles.editToggleButton} onPress={handleEditToggle}>
                <Text style={styles.editToggleText}>{isEditing ? '완료' : '수정하기'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              ref={textInputRef}
              style={styles.ocrText}
              value={editableText}
              multiline
              scrollEnabled
              autoCorrect={false}
              spellCheck={false}
              showSoftInputOnFocus={isEditing}
              onChangeText={handleTextChange}
              selectionColor="#44c3f3"
              selectionHandleColor="#0d0d0d"
              onSelectionChange={handleSelectionChange}
              textAlignVertical="top"
              placeholder="인식된 문장을 입력하거나 수정해주세요."
              placeholderTextColor="#8c8780"
              accessibilityLabel="OCR 인식 텍스트 편집"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, !hasSelection && styles.nextButtonDisabled]}
          onPress={() => onNext(selectedText.trim(), selectedBlockIds)}
          disabled={!hasSelection}
        >
          <Text style={[styles.nextText, !hasSelection && styles.nextTextDisabled]}>이 문장 선택</Text>
        </TouchableOpacity>

        <View style={styles.edgeSwipeZone} {...edgeSwipeResponder.panHandlers} />
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#44c3f3',
  },
  safeArea: { flex: 1, backgroundColor: '#44c3f3' },
  header: {
    height: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: { fontSize: 20, color: '#0d0d0d', fontWeight: '800' },
  brandTitle: { fontSize: 21, color: '#0d0d0d', fontWeight: '900' },
  headerRight: { width: 20 },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#0d0d0d',
    paddingHorizontal: 14,
    paddingTop: 18,
  },
  title: { color: '#0d0d0d', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  description: { color: '#625c54', fontSize: 12, lineHeight: 18, marginBottom: 14 },
  selectionSummary: {
    minHeight: 104,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#b8e8f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textCard: {
    flex: 1,
    minHeight: 220,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#fff',
  },
  textCardHeader: {
    minHeight: 42,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0d0d0d',
    backgroundColor: '#b8e8f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  textCardHeaderLabel: {
    color: '#0d0d0d',
    fontSize: 12,
    fontWeight: '900',
  },
  editToggleButton: {
    minWidth: 66,
    height: 30,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editToggleText: {
    color: '#44c3f3',
    fontSize: 12,
    fontWeight: '900',
  },
  ocrText: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#111',
    fontSize: 15,
    lineHeight: 25,
    backgroundColor: '#fff',
  },
  selectionSummaryLabel: {
    color: '#0d0d0d',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 5,
  },
  selectionSummaryText: {
    color: '#0d0d0d',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  selectionSummaryPlaceholder: {
    color: '#59717a',
    fontWeight: '500',
  },
  nextButton: {
    height: 50,
    marginHorizontal: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: { backgroundColor: '#7fd0ee' },
  nextText: { color: '#44c3f3', fontSize: 14, fontWeight: '900' },
  nextTextDisabled: { color: '#4c6974' },
  edgeSwipeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 28,
    zIndex: 10,
  },
});

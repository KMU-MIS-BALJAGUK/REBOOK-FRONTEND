import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { QuoteQuestionCardItem } from '../model/quoteQuestionCard.types';

type Props = {
  item: QuoteQuestionCardItem;
  onPress?: (item: QuoteQuestionCardItem) => void;
};

export function QuestionCardItem({ item, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => onPress?.(item)}>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>AI 질문 카드</Text>
        <Text style={styles.intent}>{item.intentLabel}</Text>
      </View>
      <Text style={styles.question}>{item.question}</Text>
      <Text style={styles.guide}>{item.guide}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    backgroundColor: '#fffdf7',
    padding: 16,
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0d0d0d',
    backgroundColor: '#f6c344',
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  intent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5f564c',
  },
  question: {
    fontSize: 20,
    lineHeight: 28,
    color: '#171512',
    fontWeight: '900',
  },
  guide: {
    fontSize: 13,
    lineHeight: 20,
    color: '#66707a',
  },
});

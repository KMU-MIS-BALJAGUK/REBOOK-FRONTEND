import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommunityBookTopQuoteItem } from '../model/communityBook.types';

type Props = {
  visible: boolean;
  quote: CommunityBookTopQuoteItem | null;
  onClose: () => void;
};

export function CommunityTopQuoteDetailModal({ visible, quote, onClose }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <View style={styles.centerWrap} pointerEvents="box-none">
        <Pressable style={styles.card} onPress={() => undefined}>
          {quote ? (
            <>
              <View style={styles.metaRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankBadgeText}>{quote.rank}</Text>
                </View>
                <Text style={styles.metaText}>저장 {quote.savedCount}회</Text>
              </View>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.quoteText}>{quote.quoteText}</Text>
              </ScrollView>
            </>
          ) : null}
        </Pressable>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 20,
    elevation: 20,
  },
  centerWrap: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#44c3f3',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: '#111',
    fontSize: 13,
    fontWeight: '800',
  },
  metaText: {
    color: '#444',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    maxHeight: 320,
  },
  scrollContent: {
    paddingBottom: 6,
  },
  quoteText: {
    color: '#111',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 14,
    minWidth: 108,
    minHeight: 42,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
  },
  closeButtonText: {
    color: '#111',
    fontSize: 13,
    fontWeight: '800',
  },
});

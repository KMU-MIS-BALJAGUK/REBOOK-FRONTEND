import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MyButton } from './MyButton';

type Props = {
  searchKeyword: string;
  onSearchKeywordChange: (value: string) => void;
  onPressMyPage: () => void;
  children?: React.ReactNode;
};

export function FeedTopBar({ searchKeyword, onSearchKeywordChange, onPressMyPage, children }: Props) {
  return (
    <View style={styles.topPanel}>
      <Text style={styles.brandTitle}>ReBook</Text>

      <View style={styles.homeSearchRow}>
        <View style={styles.searchPill}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="키워드를 검색하세요"
            placeholderTextColor="#9f968a"
            value={searchKeyword}
            onChangeText={onSearchKeywordChange}
            returnKeyType="search"
            blurOnSubmit
          />
        </View>
        <MyButton onPress={onPressMyPage} />
      </View>

      {children ? <View style={styles.childrenWrap}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  topPanel: {
    backgroundColor: '#44c3f3',
    paddingTop: 8,
    paddingBottom: 14,
  },
  brandTitle: {
    fontSize: 28,
    color: '#111',
    fontWeight: '900',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  homeSearchRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  childrenWrap: {
    paddingHorizontal: 16,
  },
  searchPill: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchIcon: {
    fontSize: 15,
    color: '#66707a',
    fontWeight: '700',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    paddingVertical: 0,
  },
});

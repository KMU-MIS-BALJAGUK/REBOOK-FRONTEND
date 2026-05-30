import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RegisterType } from '../../../app/types';

type Props = {
  onClose: () => void;
  onSelect: (type: RegisterType) => void;
};

export function MethodSheet({ onClose, onSelect }: Props) {
  return (
    <>
      <Pressable style={styles.overlayDim} onPress={onClose} />
      <View style={styles.methodSheet}>
        <Text style={styles.methodTitle}>문장 등록 방식 선택</Text>
        <TouchableOpacity style={styles.methodItem} onPress={() => onSelect('camera')}>
          <Text style={styles.methodItemIcon}>📷</Text>
          <View>
            <Text style={styles.methodItemTitle}>사진 촬영</Text>
            <Text style={styles.methodItemSub}>책 페이지를 촬영하여 자동 인식</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.methodItem} onPress={() => onSelect('gallery')}>
          <Text style={styles.methodItemIcon}>🖼️</Text>
          <View>
            <Text style={styles.methodItemTitle}>이미지 첨부</Text>
            <Text style={styles.methodItemSub}>갤러리에서 사진 선택</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.methodItem} onPress={() => onSelect('manual')}>
          <Text style={styles.methodItemIcon}>✍️</Text>
          <View>
            <Text style={styles.methodItemTitle}>직접 입력</Text>
            <Text style={styles.methodItemSub}>문장을 직접 입력</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlayDim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  methodSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f7f2ea',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 8,
  },
  methodTitle: { fontSize: 14, color: '#4d4439', fontWeight: '700', marginBottom: 2 },
  methodItem: {
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#f9f5ee',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  methodItemIcon: { fontSize: 15 },
  methodItemTitle: { fontSize: 13, color: '#312c25', fontWeight: '600' },
  methodItemSub: { fontSize: 11, color: '#8a8074', marginTop: 2 },
});

import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onBack: () => void;
  onPick: () => void;
  isUploading: boolean;
  uploadError: string | null;
};

export function GalleryPickerScreen({ onBack, onPick, isUploading, uploadError }: Props) {
  return (
    <SafeAreaView style={styles.gallerySafeArea}>
      <View style={styles.galleryTopBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.galleryTopText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.galleryTopText}>Photos</Text>
        <Text style={styles.galleryTopText}>Albums</Text>
      </View>
      <View style={styles.galleryGrid}>
        {[...Array(15)].map((_, index) => (
          <TouchableOpacity key={index} style={styles.galleryCell} onPress={onPick} disabled={isUploading}>
            <Text style={styles.galleryCellText}>{isUploading ? '업로드 중...' : `IMG ${index + 1}`}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gallerySafeArea: { flex: 1, backgroundColor: '#fff' },
  galleryTopBar: {
    height: 44,
    borderBottomWidth: 1,
    borderColor: '#ececec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  galleryTopText: { color: '#2f6fe0', fontSize: 13 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  galleryCell: {
    width: '25%',
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: '#eaeaea',
    backgroundColor: '#ddd6ca',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryCellText: { fontSize: 10, color: '#675f55' },
  errorText: { color: '#b25555', fontSize: 12, textAlign: 'center', marginTop: 8 },
});

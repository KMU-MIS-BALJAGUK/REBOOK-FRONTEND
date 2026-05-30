import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onBack: () => void;
  onCapture: () => void;
};

export function CameraCaptureScreen({ onBack, onCapture }: Props) {
  return (
    <SafeAreaView style={styles.captureSafeArea}>
      <View style={styles.captureTopBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cameraFrame}>
        <Text style={styles.cameraMockText}>카메라 프리뷰 (Mock)</Text>
        <View style={styles.scanGuide}>
          <Text style={styles.scanGuideText}>인식할 문장 영역에 맞춰 촬영하세요</Text>
        </View>
      </View>
      <View style={styles.captureBottomBar}>
        <TouchableOpacity style={styles.shutterButton} onPress={onCapture}>
          <Text style={styles.shutterIcon}>◉</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  captureSafeArea: { flex: 1, backgroundColor: '#f5f2eb' },
  captureTopBar: { paddingHorizontal: 14, paddingVertical: 10 },
  backText: { fontSize: 18, color: '#453d33' },
  cameraFrame: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#d8d2c8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cameraMockText: { fontSize: 13, color: '#7a7062', marginBottom: 10 },
  scanGuide: {
    width: '84%',
    borderRadius: 8,
    backgroundColor: 'rgba(126, 183, 108, 0.5)',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  scanGuideText: { textAlign: 'center', color: '#22301d', fontSize: 12, fontWeight: '600' },
  captureBottomBar: { height: 96, justifyContent: 'center', alignItems: 'center' },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterIcon: { fontSize: 26, color: '#8d7353' },
});

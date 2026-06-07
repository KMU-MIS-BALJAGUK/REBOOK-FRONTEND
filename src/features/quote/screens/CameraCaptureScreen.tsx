import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraCapturedPicture, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import type { QuoteLocalImageAsset } from '../model/quoteLocalImage.types';

type Props = {
  onBack: () => void;
  onCapture: (asset: QuoteLocalImageAsset) => Promise<void>;
  isUploading: boolean;
  uploadError: string | null;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

async function toCapturedPhotoAsset(photo: CameraCapturedPicture): Promise<QuoteLocalImageAsset> {
  if (typeof photo.uri !== 'string' || !photo.uri.trim()) {
    throw new Error('사진 정보를 확인할 수 없어요.');
  }
  if (!Number.isFinite(photo.width) || !Number.isFinite(photo.height) || photo.width <= 0 || photo.height <= 0) {
    throw new Error('사진 정보를 확인할 수 없어요.');
  }

  // Re-encoding applies the camera orientation to the pixel data so the crop
  // preview and ImageManipulator use the same coordinate system.
  const normalizeContext = ImageManipulator.ImageManipulator.manipulate(photo.uri);
  const normalizedImage = await normalizeContext.renderAsync();
  const normalizedPhoto = await normalizedImage.saveAsync({
    format: ImageManipulator.SaveFormat.JPEG,
    compress: 0.92,
  });

  return {
    uri: normalizedPhoto.uri,
    fileName: `camera-${Date.now()}.jpg`,
    mimeType: 'image/jpeg',
    fileSize: undefined,
    width: normalizedPhoto.width,
    height: normalizedPhoto.height,
  };
}

export function CameraCaptureScreen({ onBack, onCapture, isUploading, uploadError }: Props) {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  useEffect(() => {
    if (!permission) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const isBusy = isUploading || isCropping;

  const handleCapture = async () => {
    if (!cameraRef.current || !isReady || isBusy) {
      return;
    }

    try {
      setLocalError(null);
      setIsCropping(true);
      console.log('[QUOTE_CAMERA] shutter pressed');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        shutterSound: false,
      });
      if (!photo) {
        throw new Error('사진 촬영에 실패했어요.');
      }
      console.log('[QUOTE_CAMERA] photo captured', {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
      });
      const capturedAsset = await toCapturedPhotoAsset(photo);
      console.log('[QUOTE_CAMERA] capture asset ready', {
        uri: capturedAsset.uri,
        width: capturedAsset.width,
        height: capturedAsset.height,
      });
      await onCapture(capturedAsset);
      setIsCropping(false);
    } catch (error) {
      console.log('[QUOTE_CAMERA] capture error', error);
      setLocalError(error instanceof Error ? error.message : '사진 촬영에 실패했어요.');
      setIsCropping(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionText}>카메라 권한을 확인하는 중...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionText}>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={() => void requestPermission()}>
          <Text style={styles.permissionButtonText}>권한 허용</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permissionBackButton} onPress={onBack}>
          <Text style={styles.permissionBackText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          onCameraReady={() => setIsReady(true)}
        />
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문장 촬영</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.bottomBar}>
        {localError || uploadError ? <Text style={styles.errorText}>{localError ?? uploadError}</Text> : null}
        <TouchableOpacity style={styles.shutterButton} onPress={() => void handleCapture()} disabled={isBusy}>
          {isBusy ? (
            <ActivityIndicator color="#45c2f1" />
          ) : (
            <View style={styles.shutterIcon}>
              <View style={[styles.apertureBlade, styles.apertureBlade1]} />
              <View style={[styles.apertureBlade, styles.apertureBlade2]} />
              <View style={[styles.apertureBlade, styles.apertureBlade3]} />
              <View style={[styles.apertureBlade, styles.apertureBlade4]} />
              <View style={[styles.apertureBlade, styles.apertureBlade5]} />
              <View style={[styles.apertureBlade, styles.apertureBlade6]} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  backText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  headerSpacer: { width: 18 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 28,
    paddingTop: 16,
    alignItems: 'center',
    zIndex: 3,
  },
  shutterButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: '#45c2f1',
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#45c2f1',
    position: 'relative',
    overflow: 'hidden',
  },
  apertureBlade: {
    position: 'absolute',
    left: 22,
    top: -2,
    width: 4,
    height: 26,
    backgroundColor: '#45c2f1',
    borderRadius: 2,
    transformOrigin: 'center',
  },
  apertureBlade1: { transform: [{ translateY: 11 }, { rotate: '0deg' }] },
  apertureBlade2: { transform: [{ translateY: 11 }, { rotate: '60deg' }] },
  apertureBlade3: { transform: [{ translateY: 11 }, { rotate: '120deg' }] },
  apertureBlade4: { transform: [{ translateY: 11 }, { rotate: '180deg' }] },
  apertureBlade5: { transform: [{ translateY: 11 }, { rotate: '240deg' }] },
  apertureBlade6: { transform: [{ translateY: 11 }, { rotate: '300deg' }] },
  errorText: {
    color: '#f8d1d1',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 14,
  },
  permissionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  permissionButton: {
    borderRadius: 10,
    backgroundColor: '#45c2f1',
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  permissionBackButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  permissionBackText: {
    color: '#45c2f1',
    fontSize: 13,
    fontWeight: '700',
  },
});

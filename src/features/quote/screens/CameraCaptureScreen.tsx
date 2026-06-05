import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraCapturedPicture, CameraView, useCameraPermissions } from 'expo-camera';
import type { QuoteLocalImageAsset } from '../model/quoteLocalImage.types';
import * as ImageManipulator from 'expo-image-manipulator';

type Props = {
  onBack: () => void;
  onCapture: (asset: QuoteLocalImageAsset) => Promise<void>;
  isUploading: boolean;
  uploadError: string | null;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_WIDTH = Math.round(SCREEN_WIDTH * 0.88);
const FRAME_HEIGHT = Math.round(SCREEN_HEIGHT * 0.22);
const FRAME_ASPECT_RATIO = FRAME_WIDTH / FRAME_HEIGHT;

async function cropCapturedPhoto(photo: CameraCapturedPicture): Promise<QuoteLocalImageAsset> {
  const sourceRatio = photo.width / photo.height;
  let cropWidth = photo.width;
  let cropHeight = photo.height;

  if (sourceRatio > FRAME_ASPECT_RATIO) {
    cropWidth = Math.round(photo.height * FRAME_ASPECT_RATIO);
  } else {
    cropHeight = Math.round(photo.width / FRAME_ASPECT_RATIO);
  }

  const originX = Math.max(0, Math.round((photo.width - cropWidth) / 2));
  const originY = Math.max(0, Math.round((photo.height - cropHeight) / 2));
  const manipulated = await ImageManipulator.manipulateAsync(
    photo.uri,
    [
      {
        crop: {
          originX,
          originY,
          width: cropWidth,
          height: cropHeight,
        },
      },
    ],
    {
      format: ImageManipulator.SaveFormat.JPEG,
      compress: 1,
    },
  );

  return {
    uri: manipulated.uri,
    fileName: `camera-${Date.now()}.jpg`,
    mimeType: 'image/jpeg',
    fileSize: undefined,
    width: manipulated.width,
    height: manipulated.height,
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
      const photo = await cameraRef.current.takePictureAsync({ quality: 1, skipProcessing: false });
      const cropped = await cropCapturedPhoto(photo);
      await onCapture(cropped);
      setIsCropping(false);
    } catch (error) {
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
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setIsReady(true)}
      />
      <View style={styles.topShade} />
      <View style={styles.centerArea}>
        <Text style={styles.guideText}>기록할 문장을 네모 안에 맞춰주세요</Text>
        <View style={styles.cropFrame}>
          <View style={styles.cropInnerBorder} />
        </View>
      </View>
      <View style={styles.bottomShade} />
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
          {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.shutterText}>촬영</Text>}
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
  topShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: Math.max(0, (SCREEN_HEIGHT - FRAME_HEIGHT) / 2 - 70),
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    zIndex: 1,
  },
  centerArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: Math.max(76, (SCREEN_HEIGHT - FRAME_HEIGHT) / 2 - 20),
    height: FRAME_HEIGHT + 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  guideText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 18,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowRadius: 4,
  },
  cropFrame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderWidth: 2,
    borderColor: '#45c2f1',
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  cropInnerBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    margin: 2,
  },
  bottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Math.max(0, (SCREEN_HEIGHT - FRAME_HEIGHT) / 2 - 100),
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    zIndex: 1,
  },
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
    width: '100%',
    maxWidth: 320,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#45c2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterText: { color: '#000', fontSize: 15, fontWeight: '800' },
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

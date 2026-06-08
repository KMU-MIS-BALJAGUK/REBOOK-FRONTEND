import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import type { QuoteLocalImageAsset } from '../model/quoteLocalImage.types';

type Props = {
  asset: QuoteLocalImageAsset;
  onBack: () => void;
  onConfirm: (asset: QuoteLocalImageAsset) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

const MIN_CROP_HEIGHT = 80;
const MIN_CROP_WIDTH = 80;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function CameraCropScreen({ asset, onBack, onConfirm, isSubmitting, submitError }: Props) {
  const sourceWidth = asset.width ?? 1;
  const sourceHeight = asset.height ?? 1;
  const imageRatio = sourceHeight / sourceWidth;
  const [imageWidth, setImageWidth] = useState(0);
  const [leftPx, setLeftPx] = useState(24);
  const [rightPx, setRightPx] = useState(24);
  const [topPx, setTopPx] = useState(120);
  const [bottomPx, setBottomPx] = useState(280);
  const imageHeight = imageWidth > 0 ? imageWidth * imageRatio : 0;
  const initializedRef = useRef(false);
  const cropBoundsRef = useRef({
    imageWidth: 0,
    imageHeight: 0,
    left: 24,
    right: 24,
    top: 120,
    bottom: 280,
  });
  const leftStartRef = useRef(0);
  const rightStartRef = useRef(0);
  const topStartRef = useRef(0);
  const bottomStartRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [isLocalProcessing, setIsLocalProcessing] = useState(false);
  const progressRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  };

  const animateProgressTo = (target: number, duration: number, onComplete?: () => void) => {
    clearTimers();
    const current = progressRef.current;

    if (current === target) {
      if (onComplete) {
        settleTimeoutRef.current = setTimeout(() => {
          settleTimeoutRef.current = null;
          onComplete();
        }, 0);
      }
      return;
    }

    const step = target > current ? 1 : -1;
    const distance = Math.abs(target - current);
    const intervalMs = Math.max(20, Math.round(duration / Math.max(distance, 1)));
    let nextValue = current;

    intervalRef.current = setInterval(() => {
      nextValue += step;
      const reachedTarget = step > 0 ? nextValue >= target : nextValue <= target;
      const safeValue = reachedTarget ? target : nextValue;
      setProgress(safeValue);

      if (reachedTarget) {
        clearTimers();
        if (onComplete) {
          settleTimeoutRef.current = setTimeout(() => {
            settleTimeoutRef.current = null;
            onComplete();
          }, 0);
        }
      }
    }, intervalMs);
  };

  const animateProgressToAsync = (target: number, duration: number) =>
    new Promise<void>((resolve) => {
      animateProgressTo(target, duration, resolve);
    });

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });

    return () => {
      subscription.remove();
      clearTimers();
    };
  }, [onBack]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const cropWidthPx = Math.max(0, imageWidth - leftPx - rightPx);
  const cropHeightPx = Math.max(0, bottomPx - topPx);

  const updateLeft = (value: number) => {
    cropBoundsRef.current.left = value;
    setLeftPx(value);
  };

  const updateRight = (value: number) => {
    cropBoundsRef.current.right = value;
    setRightPx(value);
  };

  const updateTop = (value: number) => {
    cropBoundsRef.current.top = value;
    setTopPx(value);
  };

  const updateBottom = (value: number) => {
    cropBoundsRef.current.bottom = value;
    setBottomPx(value);
  };

  const leftResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        leftStartRef.current = cropBoundsRef.current.left;
      },
      onPanResponderMove: (_, gesture) => {
        const { imageWidth: currentImageWidth, right } = cropBoundsRef.current;
        if (currentImageWidth <= 0) return;
        updateLeft(clamp(leftStartRef.current + gesture.dx, 0, currentImageWidth - right - MIN_CROP_WIDTH));
      },
    }),
  ).current;

  const rightResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        rightStartRef.current = cropBoundsRef.current.right;
      },
      onPanResponderMove: (_, gesture) => {
        const { imageWidth: currentImageWidth, left } = cropBoundsRef.current;
        if (currentImageWidth <= 0) return;
        updateRight(clamp(rightStartRef.current - gesture.dx, 0, currentImageWidth - left - MIN_CROP_WIDTH));
      },
    }),
  ).current;

  const topResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        topStartRef.current = cropBoundsRef.current.top;
      },
      onPanResponderMove: (_, gesture) => {
        const { imageHeight: currentImageHeight, bottom } = cropBoundsRef.current;
        if (currentImageHeight <= 0) return;
        updateTop(clamp(topStartRef.current + gesture.dy, 0, bottom - MIN_CROP_HEIGHT));
      },
    }),
  ).current;

  const bottomResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        bottomStartRef.current = cropBoundsRef.current.bottom;
      },
      onPanResponderMove: (_, gesture) => {
        const { imageHeight: currentImageHeight, top } = cropBoundsRef.current;
        if (currentImageHeight <= 0) return;
        updateBottom(clamp(bottomStartRef.current + gesture.dy, top + MIN_CROP_HEIGHT, currentImageHeight));
      },
    }),
  ).current;

  const handleImageLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    const nextHeight = nextWidth * imageRatio;
    setImageWidth(nextWidth);
    cropBoundsRef.current.imageWidth = nextWidth;
    cropBoundsRef.current.imageHeight = nextHeight;
    if (nextHeight > 0 && !initializedRef.current) {
      const defaultTop = nextHeight * 0.28;
      const defaultBottom = nextHeight * 0.58;
      const horizontalInset = nextWidth * 0.06;
      updateLeft(horizontalInset);
      updateRight(horizontalInset);
      updateTop(defaultTop);
      updateBottom(defaultBottom);
      initializedRef.current = true;
    }
  };

  const handleConfirm = async () => {
    if (imageHeight <= 0 || !asset.uri) {
      return;
    }

    if (isSubmitting || isLocalProcessing) {
      return;
    }

    const originX = Math.round((leftPx / imageWidth) * sourceWidth);
    const originY = Math.round((topPx / imageHeight) * sourceHeight);
    const cropWidth = Math.max(1, Math.round((cropWidthPx / imageWidth) * sourceWidth));
    const cropHeight = Math.max(1, Math.round((cropHeightPx / imageHeight) * sourceHeight));
    const cropContext = ImageManipulator.ImageManipulator.manipulate(asset.uri);
    cropContext.crop({
      originX,
      originY,
      width: Math.min(cropWidth, sourceWidth - originX),
      height: Math.min(cropHeight, sourceHeight - originY),
    });
    setIsLocalProcessing(true);
    clearTimers();
    setProgress(0);
    animateProgressTo(99, 1000);

    try {
      const croppedImage = await cropContext.renderAsync();
      const manipulated = await croppedImage.saveAsync({
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 0.92,
      });

      await onConfirm({
        uri: manipulated.uri,
        fileName: asset.fileName,
        mimeType: 'image/jpeg',
        fileSize: undefined,
        width: manipulated.width,
        height: manipulated.height,
      });

      clearTimers();
      setProgress(100);
    } finally {
      clearTimers();
      setIsLocalProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={10} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이미지 자르기</Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={styles.guideText}>상단과 하단 핸들을 드래그해서 기록할 문장 영역을 맞춰주세요</Text>
      <View style={styles.imageStage}>
        <View style={styles.imageWrap} onLayout={handleImageLayout}>
          <Image source={{ uri: asset.uri }} style={[styles.image, { aspectRatio: sourceWidth / sourceHeight }]} resizeMode="contain" />
          {imageHeight > 0 && imageWidth > 0 ? (
            <>
              <View style={[styles.cropFrame, { top: topPx, left: leftPx, width: cropWidthPx, height: cropHeightPx }]} pointerEvents="none" />
              <View
                style={[styles.handleHorizontal, { top: topPx - 22, left: leftPx, width: cropWidthPx }]}
                {...topResponder.panHandlers}
                collapsable={false}
                pointerEvents="box-only"
              >
                <View style={styles.handleBar} />
              </View>
              <View
                style={[styles.handleHorizontal, { top: bottomPx - 22, left: leftPx, width: cropWidthPx }]}
                {...bottomResponder.panHandlers}
                collapsable={false}
                pointerEvents="box-only"
              >
                <View style={styles.handleBar} />
              </View>
              <View
                style={[styles.handleVertical, { left: leftPx - 22, top: topPx, height: cropHeightPx }]}
                {...leftResponder.panHandlers}
                collapsable={false}
                pointerEvents="box-only"
              >
                <View style={styles.handleBarVertical} />
              </View>
              <View
                style={[styles.handleVertical, { left: imageWidth - rightPx - 22, top: topPx, height: cropHeightPx }]}
                {...rightResponder.panHandlers}
                collapsable={false}
                pointerEvents="box-only"
              >
                <View style={styles.handleBarVertical} />
              </View>
            </>
          ) : null}
        </View>
      </View>
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
      <View style={styles.bottomBar}>
        {isSubmitting || isLocalProcessing ? (
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          </View>
        ) : null}
        <TouchableOpacity style={styles.primaryButton} onPress={() => void handleConfirm()} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>이 영역으로 진행</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBack} disabled={isSubmitting}>
          <Text style={styles.secondaryButtonText}>뒤로가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backButton: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerSpacer: { width: 18 },
  guideText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  imageStage: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  imageWrap: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    backgroundColor: '#111',
  },
  cropFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#45c2f1',
  },
  handleHorizontal: {
    position: 'absolute',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  handleVertical: {
    position: 'absolute',
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  handleBar: {
    width: 96,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#45c2f1',
  },
  handleBarVertical: {
    width: 6,
    height: 96,
    borderRadius: 999,
    backgroundColor: '#45c2f1',
  },
  errorText: {
    color: '#f4baba',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 12,
  },
  progressWrap: {
    marginBottom: 2,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#45c2f1',
  },
  progressText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#45c2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#031018',
    fontSize: 15,
    fontWeight: '800',
  },
});

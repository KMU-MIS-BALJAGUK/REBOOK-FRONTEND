import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  PanResponder,
  useWindowDimensions,
} from 'react-native';

type Options = {
  visible: boolean;
  onClose: () => void;
  closeThresholdRatio?: number;
  contentActivationDistance?: number;
};

export function useDismissableBottomSheet({
  visible,
  onClose,
  closeThresholdRatio = 0.2,
  contentActivationDistance = 24,
}: Options) {
  const windowDimensions = useWindowDimensions();
  const translateY = useRef(new Animated.Value(0)).current;
  const [sheetHeight, setSheetHeight] = useState(0);
  const scrollOffsetRef = useRef(0);
  const dragStartTranslateYRef = useRef(0);
  const currentTranslateYRef = useRef(0);
  const isClosingRef = useRef(false);
  const hasOpenedRef = useRef(false);

  const animateOpen = useCallback(() => {
    if (!visible || sheetHeight <= 0 || hasOpenedRef.current) {
      return;
    }

    hasOpenedRef.current = true;
    isClosingRef.current = false;
    translateY.stopAnimation();
    translateY.setValue(sheetHeight);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetHeight, translateY, visible]);

  useEffect(() => {
    if (visible) {
      animateOpen();
      return;
    }

    hasOpenedRef.current = false;
    isClosingRef.current = false;
    scrollOffsetRef.current = 0;
    translateY.stopAnimation();
    translateY.setValue(0);
  }, [animateOpen, translateY, visible]);

  const requestClose = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    hasOpenedRef.current = false;

    const target = sheetHeight > 0 ? sheetHeight : windowDimensions.height;
    translateY.stopAnimation();
    Animated.timing(translateY, {
      toValue: target,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      isClosingRef.current = false;
      if (finished) {
        translateY.setValue(0);
        onClose();
      }
    });
  }, [onClose, sheetHeight, translateY, windowDimensions.height]);

  const resetPosition = useCallback(() => {
    Animated.spring(translateY, {
      toValue: 0,
      friction: 9,
      tension: 75,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const buildPanHandlers = useCallback(
    (allowOnlyFromTop: boolean) =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          if (!visible || isClosingRef.current) {
            return false;
          }

          if (gestureState.dy <= 6) {
            return false;
          }

          if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
            return false;
          }

          if (!allowOnlyFromTop) {
            return true;
          }

          if (scrollOffsetRef.current > 0) {
            return false;
          }

          return gestureState.dy > contentActivationDistance;
        },
        onPanResponderGrant: () => {
          translateY.stopAnimation((value) => {
            dragStartTranslateYRef.current = value;
            currentTranslateYRef.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const next = Math.max(0, dragStartTranslateYRef.current + gestureState.dy);
          currentTranslateYRef.current = next;
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, gestureState) => {
          const fallbackHeight = sheetHeight > 0 ? sheetHeight : windowDimensions.height;
          const threshold = fallbackHeight * closeThresholdRatio;
          const shouldClose = currentTranslateYRef.current >= threshold && gestureState.dy > 0;

          if (shouldClose) {
            requestClose();
            return;
          }

          resetPosition();
        },
        onPanResponderTerminate: () => {
          resetPosition();
        },
      }).panHandlers,
    [
      closeThresholdRatio,
      contentActivationDistance,
      requestClose,
      resetPosition,
      sheetHeight,
      translateY,
      visible,
      windowDimensions.height,
    ],
  );

  const handlePanHandlers = useMemo(() => buildPanHandlers(false), [buildPanHandlers]);
  const contentPanHandlers = useMemo(() => buildPanHandlers(true), [buildPanHandlers]);

  const onScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollOffsetRef.current = Math.max(0, event.nativeEvent.contentOffset.y);
  }, []);

  const onSheetLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    setSheetHeight((current) => (current === nextHeight ? current : nextHeight));
  }, []);

  const sheetAnimatedStyle = useMemo(
    () => ({
      transform: [{ translateY }],
    }),
    [translateY],
  );

  return {
    handlePanHandlers,
    contentPanHandlers,
    onScroll,
    onSheetLayout,
    requestClose,
    sheetAnimatedStyle,
  };
}

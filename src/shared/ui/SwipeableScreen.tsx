import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, useWindowDimensions, ViewStyle } from 'react-native';

export type SwipeableMainScreenKey = 'home' | 'community' | 'ai-chat';

type Props = {
  screenKey: SwipeableMainScreenKey;
  onSwipeToHome?: () => void;
  onSwipeToCommunity?: () => void;
  onSwipeToAiChat?: () => void;
  enabled?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function SwipeableScreen({
  screenKey,
  onSwipeToHome,
  onSwipeToCommunity,
  onSwipeToAiChat,
  enabled = true,
  children,
  style,
}: Props) {
  const { width } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(0)).current;
  const dragStartRef = useRef(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    translateX.stopAnimation();
    translateX.setValue(0);
    isAnimatingRef.current = false;
  }, [screenKey, translateX]);

  const handleNavigate = useMemo(() => {
    if (screenKey === 'home') {
      return {
        left: onSwipeToCommunity,
        right: onSwipeToAiChat,
      };
    }

    return {
      left: screenKey === 'ai-chat' ? onSwipeToHome : undefined,
      right: screenKey === 'community' ? onSwipeToHome : undefined,
    };
  }, [onSwipeToAiChat, onSwipeToCommunity, onSwipeToHome, screenKey]);

  const animateReset = () => {
    Animated.spring(translateX, {
      toValue: 0,
      friction: 9,
      tension: 80,
      useNativeDriver: true,
    }).start(() => {
      isAnimatingRef.current = false;
    });
  };

  const animateAwayAndNavigate = (direction: 'left' | 'right') => {
    const target = direction === 'left' ? -width : width;
    const navigate = direction === 'left' ? handleNavigate.left : handleNavigate.right;

    if (!navigate || isAnimatingRef.current) {
      animateReset();
      return;
    }

    isAnimatingRef.current = true;
    Animated.timing(translateX, {
      toValue: target,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      isAnimatingRef.current = false;
      translateX.setValue(0);
      navigate();
    });
  };

  const gestureResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          if (isAnimatingRef.current) {
            return false;
          }

          const absDx = Math.abs(gestureState.dx);
          const absDy = Math.abs(gestureState.dy);
          if (absDx < 12 || absDx < absDy * 1.15) {
            return false;
          }

          if (gestureState.dx < 0) {
            return Boolean(handleNavigate.left);
          }

          return Boolean(handleNavigate.right);
        },
        onPanResponderGrant: () => {
          translateX.stopAnimation((value) => {
            dragStartRef.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const next = dragStartRef.current + gestureState.dx;
          translateX.setValue(next);
        },
        onPanResponderRelease: (_, gestureState) => {
          const threshold = width * 0.2;
          if (gestureState.dx <= -threshold && handleNavigate.left) {
            animateAwayAndNavigate('left');
            return;
          }
          if (gestureState.dx >= threshold && handleNavigate.right) {
            animateAwayAndNavigate('right');
            return;
          }

          animateReset();
        },
        onPanResponderTerminate: () => {
          animateReset();
        },
      }),
    [handleNavigate.left, handleNavigate.right, translateX, width],
  );

  if (!enabled) {
    return <Animated.View style={[{ flex: 1 }, style]}>{children}</Animated.View>;
  }

  return (
    <Animated.View style={[{ flex: 1, transform: [{ translateX }] }, style]} {...gestureResponder.panHandlers}>
      {children}
    </Animated.View>
  );
}

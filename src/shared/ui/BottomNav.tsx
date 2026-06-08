import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type BottomNavActive = 'community' | 'home' | 'ai-chat';

type Props = {
  active: BottomNavActive;
  onPressCommunity: () => void;
  onPressHome: () => void;
  onPressAiChat: () => void;
};

export function BottomNav({ active, onPressCommunity, onPressHome, onPressAiChat }: Props) {
  const navWidthRef = useRef(0);
  const activeTranslateX = useRef(new Animated.Value(0)).current;
  const [navWidth, setNavWidth] = useState(0);

  const activeIndex = useMemo(() => {
    if (active === 'community') return 0;
    if (active === 'home') return 1;
    return 2;
  }, [active]);

  const animateIndicator = (width: number, immediate = false) => {
    if (width <= 0) {
      return;
    }

    const itemWidth = width / 3;
    const target = itemWidth * activeIndex;

    activeTranslateX.stopAnimation();
    if (immediate) {
      activeTranslateX.setValue(target);
      return;
    }

    Animated.spring(activeTranslateX, {
      toValue: target,
      stiffness: 260,
      damping: 20,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    animateIndicator(navWidthRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    navWidthRef.current = width;
    setNavWidth(width);
    animateIndicator(width, true);
  };

  return (
    <View style={styles.bottomNav} onLayout={handleLayout}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeBackground,
          {
            width: navWidth ? navWidth / 3 : '33.3333%',
            transform: [{ translateX: activeTranslateX }],
          },
        ]}
      />
      <NavItem label="커뮤니티" icon="◌" active={active === 'community'} onPress={onPressCommunity} />
      <NavItem label="홈" icon="⌂" active={active === 'home'} onPress={onPressHome} />
      <NavItem label="AI 채팅" icon="◔" active={active === 'ai-chat'} onPress={onPressAiChat} />
    </View>
  );
}

type NavItemProps = {
  label: string;
  icon: string;
  active: boolean;
  onPress?: () => void;
};

function NavItem({ label, icon, active, onPress }: NavItemProps) {
  const content = (
    <>
      <Text style={[styles.bottomIcon, active && styles.bottomIconActive]}>{icon}</Text>
      <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{label}</Text>
    </>
  );

  return (
    <TouchableOpacity style={[styles.bottomItem, active && styles.bottomItemActive]} onPress={onPress} activeOpacity={0.85}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    height: 84,
    borderTopWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#44c3f3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    zIndex: 1,
  },
  bottomItemActive: {
  },
  activeBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#111',
  },
  bottomIcon: { fontSize: 22, color: '#111', marginBottom: 5 },
  bottomIconActive: { color: '#44c3f3' },
  bottomLabel: { fontSize: 11, color: '#111', fontWeight: '700' },
  bottomLabelActive: { color: '#fff' },
});

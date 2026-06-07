import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type BottomNavActive = 'community' | 'home' | 'ai-chat';

type Props = {
  active: BottomNavActive;
  onPressCommunity: () => void;
  onPressHome: () => void;
  onPressAiChat: () => void;
};

export function BottomNav({ active, onPressCommunity, onPressHome, onPressAiChat }: Props) {
  return (
    <View style={styles.bottomNav}>
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
      <Text style={styles.bottomIcon}>{icon}</Text>
      <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{label}</Text>
    </>
  );

  if (active) {
    return <View style={styles.bottomItem}>{content}</View>;
  }

  return (
    <TouchableOpacity style={styles.bottomItem} onPress={onPress} activeOpacity={0.85}>
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
  },
  bottomItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 8 },
  bottomIcon: { fontSize: 22, color: '#111', marginBottom: 5 },
  bottomLabel: { fontSize: 11, color: '#111', fontWeight: '700' },
  bottomLabelActive: { color: '#fff' },
});

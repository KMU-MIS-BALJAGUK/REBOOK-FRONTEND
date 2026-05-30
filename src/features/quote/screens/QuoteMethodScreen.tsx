import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeTabKey, RegisterType } from '../../../app/types';
import { HomeScreen } from '../../home/HomeScreen';
import { MethodSheet } from '../components/MethodSheet';

type Props = {
  nickname: string;
  tab: HomeTabKey;
  onChangeTab: (tab: HomeTabKey) => void;
  onClose: () => void;
  onSelect: (type: RegisterType) => void;
};

export function QuoteMethodScreen({ nickname, tab, onChangeTab, onClose, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <HomeScreen
        nickname={nickname}
        tab={tab}
        onChangeTab={onChangeTab}
        onPressRegister={() => {}}
        onPressCommunity={() => {}}
        onPressAiChat={() => {}}
      />
      <MethodSheet onClose={onClose} onSelect={onSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f3ee' },
});

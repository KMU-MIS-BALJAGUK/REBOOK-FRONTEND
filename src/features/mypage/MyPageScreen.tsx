import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  nickname: string;
  onPressHome: () => void;
  onPressCommunity: () => void;
  onPressAiChat: () => void;
};

type ViewMode = 'main' | 'settings';

const statCards = [
  { label: '저장한 문장', value: '142' },
  { label: '독서록 수', value: '28' },
  { label: '작성한 게시글', value: '15' },
  { label: 'AI 대화 횟수', value: '67' },
];

export function MyPageScreen({ nickname, onPressHome, onPressCommunity, onPressAiChat }: Props) {
  const [mode, setMode] = useState<ViewMode>('main');
  const displayName = nickname.trim() ? nickname : '독서가';

  if (mode === 'settings') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <View style={styles.settingsHeader}>
            <TouchableOpacity onPress={() => setMode('main')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.settingsTitle}>설정</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.groupLabel}>계정</Text>
            <SettingRow title="닉네임" sub="독서가" />

            <Text style={styles.groupLabel}>앱 설정</Text>
            <SettingRow title="알림 설정" icon="🔔" />
            <SettingRow title="AI 대화 스타일" icon="🧠" sub="친근하고 따뜻하게" />

            <Text style={styles.groupLabel}>앱 정보</Text>
            <SettingRow title="버전 정보" icon="ⓘ" right="1.0.0" />
            <SettingRow title="이용약관" />
            <SettingRow title="개인정보처리방침" />
            <SettingRow title="오픈소스 라이선스" />

            <SettingRow title="로그아웃" icon="↪" mt={10} />
            <SettingRow title="회원탈퇴" icon="⛔" danger mt={8} />
          </ScrollView>

          <BottomNav
            current="mypage"
            onPressHome={onPressHome}
            onPressCommunity={onPressCommunity}
            onPressAiChat={onPressAiChat}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.topHeader}>
          <Text style={styles.backIcon}>←</Text>
          <TouchableOpacity onPress={() => setMode('settings')}>
            <Text style={styles.settingIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileWrap}>
            <View style={styles.avatar}><Text style={styles.avatarText}>나</Text></View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.desc}>독서가님의 성장중</Text>
          </View>

          <View style={styles.plusCard}>
            <Text style={styles.plusTitle}>👑 ReBook Plus</Text>
            <Text style={styles.plusBody}>월 9900원으로 나의 독서 경험을 더 깊게 만들어보세요.</Text>
            <Text style={styles.plusList}>• 내 독서 성향 분석</Text>
            <Text style={styles.plusList}>• 감정 키워드 리포트</Text>
            <Text style={styles.plusList}>• AI 해석 확장</Text>
            <Text style={styles.plusList}>• 내가 쓴 서평을 모아보기</Text>
            <TouchableOpacity style={styles.plusBtn}><Text style={styles.plusBtnText}>자세히 보기</Text></TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            {statCards.map((item) => (
              <View key={item.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>내 독서 분석</Text>
          <View style={styles.analysisCard}>
            <Text style={styles.analysisLabel}>자주 작성한 감정</Text>
            <Text style={styles.analysisValue}>💛 설렘 (45회)</Text>
            <Text style={styles.analysisLabel}>많이 저장된 키워드</Text>
            <View style={styles.tagRow}>
              <Tag text="성장" />
              <Tag text="관계" />
              <Tag text="사유" />
              <Tag text="시간" />
            </View>
            <View style={styles.analysisMetaRow}>
              <View>
                <Text style={styles.analysisLabel}>많이 읽은 분야</Text>
                <Text style={styles.analysisMetaStrong}>소설</Text>
              </View>
              <View>
                <Text style={styles.analysisLabel}>이번 달 남긴 문장</Text>
                <Text style={styles.analysisMetaStrong}>23개</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <BottomNav
          current="mypage"
          onPressHome={onPressHome}
          onPressCommunity={onPressCommunity}
          onPressAiChat={onPressAiChat}
        />
      </View>
    </SafeAreaView>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <View style={styles.tag}><Text style={styles.tagText}>{text}</Text></View>
  );
}

type SettingRowProps = {
  title: string;
  sub?: string;
  right?: string;
  icon?: string;
  danger?: boolean;
  mt?: number;
};

function SettingRow({ title, sub, right, icon, danger, mt }: SettingRowProps) {
  return (
    <TouchableOpacity style={[styles.settingRow, mt ? { marginTop: mt } : null]}>
      <View style={styles.settingLeft}>
        {icon ? <Text style={styles.settingRowIcon}>{icon}</Text> : null}
        <View>
          <Text style={[styles.settingRowTitle, danger && styles.settingRowTitleDanger]}>{title}</Text>
          {sub ? <Text style={styles.settingRowSub}>{sub}</Text> : null}
        </View>
      </View>
      <Text style={styles.settingRight}>{right ?? '›'}</Text>
    </TouchableOpacity>
  );
}

type BottomNavProps = {
  current: 'mypage';
  onPressHome: () => void;
  onPressCommunity: () => void;
  onPressAiChat: () => void;
};

function BottomNav({ onPressHome, onPressCommunity, onPressAiChat }: BottomNavProps) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.bottomItem} onPress={onPressCommunity}>
        <Text style={styles.bottomIcon}>◌</Text>
        <Text style={styles.bottomLabel}>커뮤니티</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomItem} onPress={onPressHome}>
        <Text style={styles.bottomIcon}>⌂</Text>
        <Text style={styles.bottomLabel}>홈</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomItem} onPress={onPressAiChat}>
        <Text style={styles.bottomIcon}>◔</Text>
        <Text style={styles.bottomLabel}>AI 채팅</Text>
      </TouchableOpacity>
      <View style={styles.bottomItem}>
        <Text style={styles.bottomIcon}>⚪</Text>
        <Text style={styles.bottomLabelActive}>마이</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f3ee' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  backIcon: { fontSize: 18, color: '#4a4035' },
  settingIcon: { fontSize: 14, color: '#6d6256' },
  profileWrap: { alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#8d7353',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  name: { fontSize: 26, fontWeight: '700', color: '#2f2a24', marginBottom: 3 },
  desc: { fontSize: 11, color: '#978c7d' },
  plusCard: {
    borderRadius: 12,
    backgroundColor: '#8d7353',
    padding: 12,
    marginBottom: 10,
  },
  plusTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  plusBody: { color: '#ede4d8', fontSize: 11, lineHeight: 16, marginBottom: 8 },
  plusList: { color: '#f5ece2', fontSize: 11, lineHeight: 17 },
  plusBtn: {
    height: 34,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtnText: { color: '#6d5840', fontWeight: '700', fontSize: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, marginBottom: 12 },
  statCard: {
    width: '48.8%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#f9f5ef',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  statLabel: { color: '#94887a', fontSize: 10, marginBottom: 5 },
  statValue: { color: '#2f2a24', fontSize: 24, fontWeight: '700' },
  sectionTitle: { fontSize: 14, color: '#3e352b', fontWeight: '700', marginBottom: 7 },
  analysisCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#f9f5ef',
    padding: 11,
    marginBottom: 10,
  },
  analysisLabel: { fontSize: 10, color: '#988d7f', marginBottom: 4 },
  analysisValue: { fontSize: 12, color: '#4b4236', marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  tag: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4dacd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f3ede3',
  },
  tagText: { fontSize: 10, color: '#7f7466' },
  analysisMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  analysisMetaStrong: { fontSize: 16, color: '#3f362d', fontWeight: '700' },
  settingsHeader: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  settingsTitle: { fontSize: 16, color: '#2f2a24', fontWeight: '700' },
  headerSpacer: { width: 18 },
  groupLabel: { fontSize: 10, color: '#9a8f81', marginBottom: 6, marginTop: 4 },
  settingRow: {
    minHeight: 54,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#f9f5ef',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingRowIcon: { fontSize: 13, color: '#8d7f6f' },
  settingRowTitle: { fontSize: 13, color: '#3f362d', fontWeight: '600' },
  settingRowTitleDanger: { color: '#d16456' },
  settingRowSub: { fontSize: 10, color: '#978c7d', marginTop: 3 },
  settingRight: { fontSize: 12, color: '#9a8f81' },
  bottomNav: {
    height: 48,
    borderTopWidth: 1,
    borderColor: '#e6ddcf',
    backgroundColor: '#f8f4ed',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  bottomItem: { alignItems: 'center', justifyContent: 'center' },
  bottomIcon: { fontSize: 14, color: '#8f8578', marginBottom: 1 },
  bottomLabel: { fontSize: 10, color: '#92897d' },
  bottomLabelActive: { fontSize: 10, color: '#8d7353', fontWeight: '700' },
});

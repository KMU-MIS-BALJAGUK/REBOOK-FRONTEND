import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMyProfile } from './hooks/useMyProfile';
import { toUserMessage } from '../../shared/utils/apiError';
import { useUpdateMyNickname } from './hooks/useUpdateMyNickname';
import { useUpdateMyBio } from './hooks/useUpdateMyBio';
import { useMyInsights } from './hooks/useMyInsights';

type Props = {
  nickname: string;
  onPressHome: () => void;
  onPressCommunity: () => void;
  onPressAiChat: () => void;
};

type ViewMode = 'main' | 'settings';

export function MyPageScreen({ nickname, onPressHome, onPressCommunity, onPressAiChat }: Props) {
  const [mode, setMode] = useState<ViewMode>('main');
  const [isNicknameEditVisible, setIsNicknameEditVisible] = useState(false);
  const [isBioEditVisible, setIsBioEditVisible] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const myProfileQuery = useMyProfile();
  const myInsightsQuery = useMyInsights();
  const updateNicknameMutation = useUpdateMyNickname();
  const updateBioMutation = useUpdateMyBio();
  const profile = myProfileQuery.data;
  const insights = myInsightsQuery.data;
  const displayName = profile?.nickname?.trim() || (nickname.trim() ? nickname : '독서가');
  const displayBio = profile?.bio?.trim() || '책과 함께 성장하는 중';
  const displayInitial = profile?.initial?.trim() || '나';
  const statCards = [
    { label: '저장한 문장', value: String(insights?.savedQuoteCount ?? 0) },
    { label: '등록한 책', value: String(insights?.registeredBookCount ?? 0) },
    { label: '작성한 게시글', value: String(insights?.writtenPostCount ?? 0) },
    { label: 'AI 대화 횟수', value: String(insights?.aiConversationCount ?? 0) },
  ];

  const handleOpenNicknameEdit = () => {
    setNicknameInput(displayName);
    setNicknameError(null);
    setIsNicknameEditVisible(true);
  };

  const handleUpdateNickname = () => {
    if (updateNicknameMutation.isPending) {
      return;
    }

    const trimmedNickname = nicknameInput.trim();
    if (trimmedNickname.length < 2 || trimmedNickname.length > 12) {
      setNicknameError('닉네임은 2자 이상 12자 이하로 입력해주세요.');
      return;
    }

    setNicknameError(null);
    updateNicknameMutation.mutate(
      { nickname: trimmedNickname },
      {
        onSuccess: () => {
          setIsNicknameEditVisible(false);
        },
      },
    );
  };

  const handleOpenBioEdit = () => {
    setBioInput(displayBio);
    setBioError(null);
    setIsBioEditVisible(true);
  };

  const handleUpdateBio = () => {
    if (updateBioMutation.isPending) {
      return;
    }

    const trimmedBio = bioInput.trim();
    if (trimmedBio.length > 30) {
      setBioError('한줄소개는 30자 이하로 입력해주세요.');
      return;
    }

    setBioError(null);
    updateBioMutation.mutate(
      { bio: trimmedBio },
      {
        onSuccess: () => {
          setIsBioEditVisible(false);
        },
      },
    );
  };

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
            <SettingRow title="닉네임" sub={displayName} />

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
            <View style={styles.avatar}><Text style={styles.avatarText}>{displayInitial}</Text></View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{displayName}</Text>
              <TouchableOpacity style={styles.editNicknameButton} onPress={handleOpenNicknameEdit}>
                <Text style={styles.editNicknameButtonText}>✎</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bioRow}>
              <Text style={styles.desc}>{displayBio}</Text>
              <TouchableOpacity style={styles.editNicknameButton} onPress={handleOpenBioEdit}>
                <Text style={styles.editNicknameButtonText}>✎</Text>
              </TouchableOpacity>
            </View>
            {myProfileQuery.isLoading ? <Text style={styles.desc}>프로필을 불러오는 중...</Text> : null}
            {myProfileQuery.isError ? <Text style={styles.errorText}>{toUserMessage(myProfileQuery.error)}</Text> : null}
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
          {myInsightsQuery.isLoading ? <Text style={styles.desc}>독서 분석을 불러오는 중...</Text> : null}
          {myInsightsQuery.isError ? <Text style={styles.errorText}>{toUserMessage(myInsightsQuery.error)}</Text> : null}
          <View style={styles.analysisCard}>
            <Text style={styles.analysisLabel}>자주 작성한 감정</Text>
            <Text style={styles.analysisValue}>
              {insights ? `${insights.favoriteEmotion.emoji} ${insights.favoriteEmotion.label} (${insights.favoriteEmotion.count}회)` : '-'}
            </Text>
            <Text style={styles.analysisLabel}>많이 저장된 키워드</Text>
            <View style={styles.tagRow}>
              {(insights?.topKeywords ?? []).length > 0
                ? (insights?.topKeywords ?? []).map((keyword) => <Tag key={keyword} text={keyword} />)
                : <Text style={styles.analysisValue}>키워드 없음</Text>}
            </View>
            <View style={styles.analysisMetaRow}>
              <View>
                <Text style={styles.analysisLabel}>많이 읽은 분야</Text>
                <Text style={styles.analysisMetaStrong}>{insights?.favoriteGenre.label ?? '-'}</Text>
              </View>
              <View>
                <Text style={styles.analysisLabel}>이번 달 저장 문장</Text>
                <Text style={styles.analysisMetaStrong}>{insights ? `${insights.savedQuotesThisMonth}개` : '-'}</Text>
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

      <Modal visible={isNicknameEditVisible} transparent animationType="fade" onRequestClose={() => setIsNicknameEditVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>닉네임 수정</Text>
            <TextInput
              style={styles.inputBox}
              value={nicknameInput}
              onChangeText={setNicknameInput}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor="#9f968a"
              maxLength={12}
            />
            {nicknameError ? <Text style={styles.errorText}>{nicknameError}</Text> : null}
            {updateNicknameMutation.isError ? <Text style={styles.errorText}>{toUserMessage(updateNicknameMutation.error)}</Text> : null}
            <View style={styles.editFooterRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsNicknameEditVisible(false)}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleUpdateNickname}
                disabled={updateNicknameMutation.isPending}
              >
                <Text style={styles.confirmButtonText}>
                  {updateNicknameMutation.isPending ? '저장 중...' : '저장'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isBioEditVisible} transparent animationType="fade" onRequestClose={() => setIsBioEditVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>한줄소개 수정</Text>
            <TextInput
              style={styles.inputBox}
              value={bioInput}
              onChangeText={setBioInput}
              placeholder="한줄소개를 입력하세요"
              placeholderTextColor="#9f968a"
              maxLength={30}
            />
            {bioError ? <Text style={styles.errorText}>{bioError}</Text> : null}
            {updateBioMutation.isError ? <Text style={styles.errorText}>{toUserMessage(updateBioMutation.error)}</Text> : null}
            <View style={styles.editFooterRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsBioEditVisible(false)}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleUpdateBio}
                disabled={updateBioMutation.isPending}
              >
                <Text style={styles.confirmButtonText}>
                  {updateBioMutation.isPending ? '저장 중...' : '저장'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bioRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 26, fontWeight: '700', color: '#2f2a24', marginBottom: 3 },
  desc: { fontSize: 11, color: '#978c7d' },
  errorText: { fontSize: 11, color: '#b25555', marginTop: 4 },
  editNicknameButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#d8cdbf',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4efe7',
  },
  editNicknameButtonText: { color: '#6c6256', fontSize: 11, fontWeight: '700' },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(32, 26, 20, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#f9f6f0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    padding: 16,
  },
  modalTitle: { fontSize: 16, color: '#2f2a24', fontWeight: '700', marginBottom: 10 },
  inputBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2d8cb',
    backgroundColor: '#f7f2ea',
    paddingHorizontal: 10,
    minHeight: 38,
    marginBottom: 8,
    color: '#352f27',
  },
  editFooterRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  cancelButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8cdbf',
    backgroundColor: '#f4efe7',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cancelButtonText: { color: '#6c6256', fontSize: 12, fontWeight: '700' },
  confirmButton: {
    borderRadius: 8,
    backgroundColor: '#8d7353',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  confirmButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
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

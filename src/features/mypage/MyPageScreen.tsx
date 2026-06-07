import React, { useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMyProfile } from './hooks/useMyProfile';
import { toUserMessage } from '../../shared/utils/apiError';
import { useUpdateMyNickname } from './hooks/useUpdateMyNickname';
import { useUpdateMyBio } from './hooks/useUpdateMyBio';
import { useMyInsights } from './hooks/useMyInsights';
import { useLogout } from './hooks/useLogout';
import { useDeleteAccount } from './hooks/useDeleteAccount';

type Props = {
  nickname: string;
  onPressHome: () => void;
  onPressCommunity: () => void;
  onPressAiChat: () => void;
  onLoggedOut: () => void;
};

type ViewMode = 'main' | 'settings';

export function MyPageScreen({ nickname, onPressHome, onPressCommunity, onPressAiChat, onLoggedOut }: Props) {
  void onPressCommunity;
  void onPressAiChat;
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
  const logoutMutation = useLogout();
  const deleteAccountMutation = useDeleteAccount();
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

  const handleLogout = () => {
    if (logoutMutation.isPending) {
      return;
    }

    Alert.alert('로그아웃하시겠습니까?', '', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: () => {
          logoutMutation.mutate(undefined, {
            onSuccess: () => {
              onLoggedOut();
            },
          });
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    if (deleteAccountMutation.isPending) {
      return;
    }

    Alert.alert('회원탈퇴하시겠습니까?', '계정은 복구할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: () => {
          Alert.prompt(
            '탈퇴 사유',
            '선택: NOT_USING / PRICE_TOO_HIGH / MISSING_FEATURE / OTHER',
            [
              {
                text: '취소',
                style: 'cancel',
              },
              {
                text: '확인',
                onPress: (reasonText?: string) => {
                  const reason = normalizeDeleteReason(reasonText);
                  deleteAccountMutation.mutate(
                    reason ? { reason } : undefined,
                    {
                      onSuccess: () => {
                        onLoggedOut();
                      },
                    },
                  );
                },
              },
            ],
            'plain-text',
          );
        },
      },
    ]);
  };

  const editModals = (
    <>
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
    </>
  );

  if (mode === 'settings') {
    return (
      <>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          <View style={styles.screenShell}>
            <View style={styles.settingsHeader}>
              <TouchableOpacity style={styles.headerIconButton} onPress={() => setMode('main')}>
                <Text style={styles.headerIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.settingsTitle}>설정</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.settingsScroll} contentContainerStyle={styles.settingsScrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.groupLabel}>계정</Text>
              <SettingRow title="닉네임 수정" sub={displayName} onPress={handleOpenNicknameEdit} />
              <SettingRow title="한줄소개 수정" sub={displayBio} onPress={handleOpenBioEdit} />

              <Text style={styles.groupLabel}>앱 설정</Text>
              <SettingRow title="알림 설정" icon="🔔" />
              <SettingRow title="AI 대화 스타일" icon="✦" sub="친근하고 따뜻하게" />

              <Text style={styles.groupLabel}>앱 정보</Text>
              <SettingRow title="버전 정보" icon="ⓘ" right="1.0.0" />
              <SettingRow title="이용약관" />
              <SettingRow title="개인정보처리방침" />
              <SettingRow title="오픈소스 라이선스" />

              {logoutMutation.isError ? <Text style={styles.errorText}>{toUserMessage(logoutMutation.error)}</Text> : null}
              <SettingRow
                title={logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                icon="↪"
                mt={10}
                onPress={handleLogout}
                disabled={logoutMutation.isPending}
              />
              {deleteAccountMutation.isError ? <Text style={styles.errorText}>{toUserMessage(deleteAccountMutation.error)}</Text> : null}
              <SettingRow
                title={deleteAccountMutation.isPending ? '탈퇴 처리 중...' : '회원탈퇴'}
                icon="⛔"
                danger
                mt={8}
                onPress={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
        {editModals}
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.screenShell}>
          <View style={styles.topPanel}>
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.headerIconButton} onPress={onPressHome}>
                <Text style={styles.headerIcon}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode('settings')}>
                <Text style={styles.settingIcon}>⚙</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.profileWrap}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{displayInitial}</Text></View>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.desc}>{displayBio}</Text>
              {myProfileQuery.isLoading ? <Text style={styles.loadingText}>프로필을 불러오는 중...</Text> : null}
              {myProfileQuery.isError ? <Text style={styles.errorText}>{toUserMessage(myProfileQuery.error)}</Text> : null}
            </View>

            <View style={styles.plusCard}>
              <Text style={styles.plusTitle}>👑 ReBook Plus</Text>
              <Text style={styles.plusBody}>월 9900원으로 나의 독서 취향을 더 깊게 확인해보세요.</Text>
              <Text style={styles.plusList}>• 내 독서 성향 분석</Text>
              <Text style={styles.plusList}>• 감정/키워드 리포트</Text>
              <Text style={styles.plusList}>• AI 해석 확장</Text>
              <Text style={styles.plusList}>• 내가 쓴 게시물 모아보기</Text>
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

            <View style={styles.analysisSectionDivider} />
            <Text style={styles.sectionTitle}>내 독서 분석</Text>
            {myInsightsQuery.isLoading ? <Text style={styles.loadingText}>독서 분석을 불러오는 중...</Text> : null}
            {myInsightsQuery.isError ? <Text style={styles.errorText}>{toUserMessage(myInsightsQuery.error)}</Text> : null}
            <View style={styles.analysisCard}>
              <Text style={styles.analysisLabel}>자주 저장한 감정</Text>
              <View style={styles.analysisEmotionRow}>
                <Text style={styles.analysisEmotion}>{insights ? `${insights.favoriteEmotion.emoji}` : '🤔'}</Text>
                <Text style={styles.analysisEmotionMeta}>
                  {insights ? `${insights.favoriteEmotion.count}회` : '-'}
                </Text>
              </View>

              <Text style={styles.analysisLabel}>많이 저장한 키워드</Text>
              <View style={styles.tagRow}>
                {(insights?.topKeywords ?? []).length > 0
                  ? (insights?.topKeywords ?? []).map((keyword) => <Tag key={keyword} text={keyword} />)
                  : <Text style={styles.analysisValue}>키워드 없음</Text>}
              </View>

              <View style={styles.analysisMetaRow}>
                <View style={styles.analysisMetaCell}>
                  <Text style={styles.analysisLabel}>많이 읽은 분야</Text>
                  <Text style={styles.analysisMetaStrong}>{insights?.favoriteGenre.label ?? '-'}</Text>
                </View>
                <View style={styles.analysisMetaCell}>
                  <Text style={styles.analysisLabel}>이번 달 저장 문장</Text>
                  <Text style={styles.analysisMetaStrong}>{insights ? `${insights.savedQuotesThisMonth}개` : '-'}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
      {editModals}
    </>
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
  onPress?: () => void;
  disabled?: boolean;
};

function SettingRow({ title, sub, right, icon, danger, mt, onPress, disabled }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, mt ? { marginTop: mt } : null, disabled ? styles.settingRowDisabled : null]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.settingLeft}>
        {icon ? <View style={[styles.settingRowIconWrap, danger && styles.settingRowIconWrapDanger]}><Text style={[styles.settingRowIcon, danger && styles.settingRowIconDanger]}>{icon}</Text></View> : null}
        <View>
          <Text style={[styles.settingRowTitle, danger && styles.settingRowTitleDanger]}>{title}</Text>
          {sub ? <Text style={styles.settingRowSub}>{sub}</Text> : null}
        </View>
      </View>
      <Text style={styles.settingRight}>{right ?? '›'}</Text>
    </TouchableOpacity>
  );
}

function normalizeDeleteReason(value?: string): 'NOT_USING' | 'PRICE_TOO_HIGH' | 'MISSING_FEATURE' | 'OTHER' | undefined {
  const trimmed = value?.trim().toUpperCase();
  if (trimmed === 'NOT_USING' || trimmed === 'PRICE_TOO_HIGH' || trimmed === 'MISSING_FEATURE' || trimmed === 'OTHER') {
    return trimmed;
  }
  return undefined;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111' },
  screenShell: { flex: 1, backgroundColor: '#111' },
  topPanel: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  mainScroll: { flex: 1, backgroundColor: '#111' },
  mainScrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },
  settingsScroll: { flex: 1, backgroundColor: '#111' },
  settingsScrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingsHeader: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 18, color: '#f3eee7', fontWeight: '700' },
  settingIcon: { fontSize: 18, color: '#f3eee7', fontWeight: '700' },
  settingsTitle: { fontSize: 18, color: '#f3eee7', fontWeight: '700' },
  headerSpacer: { width: 30 },
  profileWrap: { alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#44c3f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { color: '#111', fontSize: 34, fontWeight: '700' },
  name: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  desc: { fontSize: 13, color: '#44c3f3' },
  loadingText: { fontSize: 12, color: '#bfc6cb', marginTop: 6 },
  errorText: { fontSize: 11, color: '#ff7f7f', marginTop: 6 },
  editNicknameButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#44c3f3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  editNicknameButtonText: { color: '#44c3f3', fontSize: 11, fontWeight: '700' },
  plusCard: {
    borderRadius: 2,
    backgroundColor: '#44c3f3',
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#111',
  },
  plusTitle: { color: '#111', fontSize: 17, fontWeight: '700', marginBottom: 8 },
  plusBody: { color: '#111', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  plusList: { color: '#111', fontSize: 12, lineHeight: 18 },
  plusBtn: {
    height: 40,
    marginTop: 12,
    borderRadius: 0,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtnText: { color: '#44c3f3', fontWeight: '700', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, marginBottom: 16 },
  statCard: {
    width: '48.8%',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  statLabel: { color: '#d0eef9', fontSize: 10, marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 26, fontWeight: '700' },
  analysisSectionDivider: { height: 1, backgroundColor: '#3d3d3d', marginBottom: 12 },
  sectionTitle: { fontSize: 16, color: '#fff', fontWeight: '700', marginBottom: 10 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#111',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#44c3f3',
    padding: 16,
  },
  modalTitle: { fontSize: 17, color: '#fff', fontWeight: '700', marginBottom: 10 },
  inputBox: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    minHeight: 38,
    marginBottom: 8,
    color: '#fff',
  },
  editFooterRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  cancelButton: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cancelButtonText: { color: '#44c3f3', fontSize: 12, fontWeight: '700' },
  confirmButton: {
    borderRadius: 2,
    backgroundColor: '#44c3f3',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  confirmButtonText: { color: '#111', fontSize: 12, fontWeight: '700' },
  analysisCard: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
  },
  analysisLabel: { fontSize: 10, color: '#6d6256', marginBottom: 4 },
  analysisValue: { fontSize: 12, color: '#4b4236', marginBottom: 8 },
  analysisEmotionRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  analysisEmotion: { fontSize: 28, color: '#111', fontWeight: '700' },
  analysisEmotionMeta: { fontSize: 13, color: '#4b4236' },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  tag: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#44c3f3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#44c3f3',
  },
  tagText: { fontSize: 10, color: '#111', fontWeight: '700' },
  analysisMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  analysisMetaCell: { flex: 1 },
  analysisMetaStrong: { fontSize: 18, color: '#3f362d', fontWeight: '700' },
  groupLabel: { fontSize: 11, color: '#9a8f81', marginBottom: 6, marginTop: 4 },
  settingRow: {
    minHeight: 54,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settingRowDisabled: {
    opacity: 0.6,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingRowIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4efe7',
  },
  settingRowIconWrapDanger: {
    backgroundColor: '#f8e7e3',
  },
  settingRowIcon: { fontSize: 13, color: '#8d7f6f' },
  settingRowIconDanger: { color: '#d16456' },
  settingRowTitle: { fontSize: 13, color: '#3f362d', fontWeight: '600' },
  settingRowTitleDanger: { color: '#d16456' },
  settingRowSub: { fontSize: 10, color: '#978c7d', marginTop: 3 },
  settingRight: { fontSize: 12, color: '#9a8f81' },
});

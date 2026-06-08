import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Modal,
  PanResponder,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMyProfile } from './hooks/useMyProfile';
import { toUserMessage } from '../../shared/utils/apiError';
import { useUpdateMyNickname } from './hooks/useUpdateMyNickname';
import { useUpdateMyBio } from './hooks/useUpdateMyBio';
import { useMyInsights } from './hooks/useMyInsights';
import { useLogout } from './hooks/useLogout';
import { useDeleteAccount } from './hooks/useDeleteAccount';
import { FreeReadingReportPanel } from './components/FreeReadingReportPanel';
import { FreeReadingReportListSection } from './components/FreeReadingReportListSection';
import { useGenerateFreeReadingReport } from './hooks/useGenerateFreeReadingReport';
import { useFreeReadingReport } from './hooks/useFreeReadingReport';
import { useFreeReadingReports } from './hooks/useFreeReadingReports';
import { FreeReadingReportInlineSection } from './components/FreeReadingReportInlineSection';

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
  const windowWidth = Dimensions.get('window').width;
  const [mode, setMode] = useState<ViewMode>('main');
  const [isNicknameEditVisible, setIsNicknameEditVisible] = useState(false);
  const [isBioEditVisible, setIsBioEditVisible] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [freeReportId, setFreeReportId] = useState<number | null>(null);
  const [freeReadingReportSectionMode, setFreeReadingReportSectionMode] = useState<'intro' | 'loading' | 'list' | 'result' | null>(null);
  const myProfileQuery = useMyProfile();
  const myInsightsQuery = useMyInsights();
  const updateNicknameMutation = useUpdateMyNickname();
  const updateBioMutation = useUpdateMyBio();
  const logoutMutation = useLogout();
  const deleteAccountMutation = useDeleteAccount();
  const generateFreeReadingReportMutation = useGenerateFreeReadingReport();
  const freeReadingReportQuery = useFreeReadingReport({
    reportId: freeReportId,
    enabled: freeReportId !== null && freeReadingReportSectionMode !== null,
  });
  const freeReadingReportsQuery = useFreeReadingReports({
    enabled: true,
  });
  const screenTranslateX = useRef(new Animated.Value(0)).current;
  const profile = myProfileQuery.data;
  const insights = myInsightsQuery.data;
  const canGenerateFreeReadingReport = (insights?.savedQuoteCount ?? 0) > 0;
  const displayName = profile?.nickname?.trim() || (nickname.trim() ? nickname : '독서가');
  const displayBio = profile?.bio?.trim() || '책과 함께 성장하는 중';
  const displayInitial = profile?.initial?.trim() || '나';
  const isAnyOverlayVisible =
    isNicknameEditVisible || isBioEditVisible || false;
  const statCards = [
    { label: '저장한 문장', value: String(insights?.savedQuoteCount ?? 0) },
    { label: '등록한 책', value: String(insights?.registeredBookCount ?? 0) },
    { label: '작성한 게시글', value: String(insights?.writtenPostCount ?? 0) },
    { label: 'AI 대화 횟수', value: String(insights?.aiConversationCount ?? 0) },
  ];

  useEffect(() => {
    screenTranslateX.setValue(0);
  }, [mode, screenTranslateX]);

  const handleSwipeBack = () => {
    Animated.timing(screenTranslateX, {
      toValue: windowWidth,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      screenTranslateX.setValue(0);

      if (mode === 'settings') {
        setMode('main');
        return;
      }

      Keyboard.dismiss();
      onPressHome();
    });
  };

  const handleSwipeCancel = () => {
    Animated.spring(screenTranslateX, {
      toValue: 0,
      damping: 22,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const screenPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_, gestureState) => {
          if (isAnyOverlayVisible) {
            return false;
          }

          return gestureState.x0 <= 32;
        },
        onStartShouldSetPanResponderCapture: (_, gestureState) => {
          if (isAnyOverlayVisible) {
            return false;
          }

          return gestureState.x0 <= 32;
        },
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (isAnyOverlayVisible) {
            return false;
          }

          const isHorizontalIntent = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.1;
          return gestureState.x0 <= 32 && gestureState.dx > 4 && isHorizontalIntent;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          if (isAnyOverlayVisible) {
            return false;
          }

          const isHorizontalIntent = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.1;
          return gestureState.x0 <= 32 && gestureState.dx > 4 && isHorizontalIntent;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx <= 0) {
            screenTranslateX.setValue(0);
            return;
          }

          const maxTranslateX = windowWidth * 0.42;
          screenTranslateX.setValue(Math.min(gestureState.dx, maxTranslateX));
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldGoBack = gestureState.dx > windowWidth * 0.2;

          if (shouldGoBack) {
            handleSwipeBack();
            return;
          }

          handleSwipeCancel();
        },
        onPanResponderTerminate: handleSwipeCancel,
        onPanResponderTerminationRequest: () => false,
      }),
    [handleSwipeBack, handleSwipeCancel, isAnyOverlayVisible, screenTranslateX, windowWidth],
  );

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

  const handleGenerateFreeReport = () => {
    setFreeReadingReportSectionMode('loading');
    generateFreeReadingReportMutation.mutate(undefined, {
      onSuccess: async (result) => {
        setFreeReportId(result.reportId);
      },
    });
  };

  const handleOpenFreeReportAnalysis = () => {
    setFreeReadingReportSectionMode('intro');
  };

  const handleStartFreeReportGeneration = () => {
    if (!canGenerateFreeReadingReport) {
      return;
    }

    setFreeReadingReportSectionMode('loading');
    handleGenerateFreeReport();
  };

  const handleOpenFreeReportList = () => {
    setFreeReadingReportSectionMode('list');
  };

  const handleOpenExternalLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('링크를 열 수 없습니다.');
      return;
    }

    await Linking.openURL(url);
  };

  const handleSelectFreeReport = (reportId: number) => {
    setFreeReportId(reportId);
    setFreeReadingReportSectionMode('loading');
  };

  const handleCloseFreeReportSection = () => {
    setFreeReadingReportSectionMode(null);
  };

  useEffect(() => {
    if (freeReadingReportSectionMode === 'loading' && freeReadingReportQuery.data?.fetchStatus === 'READY') {
      setFreeReadingReportSectionMode('result');
    }
  }, [freeReadingReportQuery.data?.fetchStatus, freeReadingReportSectionMode]);

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
          <Animated.View style={[styles.screenShell, { transform: [{ translateX: screenTranslateX }] }]} pointerEvents="box-none">
            <View style={styles.edgeSwipeZone} pointerEvents="box-only" {...screenPanResponder.panHandlers} />
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
              <SettingRow title="이용약관" onPress={() => handleOpenExternalLink('https://tidy-hide-620.notion.site/3786a5db448b8087a4c1df54a9d2f812?pvs=74')} />
              <SettingRow title="개인정보처리방침" onPress={() => handleOpenExternalLink('https://tidy-hide-620.notion.site/3786a5db448b804aab13c8ff4a6c0a4d')} />
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
          </Animated.View>
        </SafeAreaView>
        {editModals}
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={[styles.screenShell, { transform: [{ translateX: screenTranslateX }] }]} pointerEvents="box-none">
          <View style={styles.edgeSwipeZone} pointerEvents="box-only" {...screenPanResponder.panHandlers} />
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

            <View style={styles.statsGrid}>
              {statCards.map((item) => (
                <View key={item.label} style={styles.statCard}>
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <Text style={styles.statValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            <FreeReadingReportPanel
              onOpenAnalysis={handleOpenFreeReportAnalysis}
              onOpenList={handleOpenFreeReportList}
              activeMode={
                freeReadingReportSectionMode && freeReadingReportSectionMode !== 'list'
                  ? 'analysis'
                  : freeReadingReportSectionMode === 'list'
                    ? 'list'
                    : null
              }
            />

            {freeReadingReportSectionMode && freeReadingReportSectionMode !== 'list' ? (
              <FreeReadingReportInlineSection
                mode={freeReadingReportSectionMode}
                connected
                canGenerate={canGenerateFreeReadingReport}
                status={
                  generateFreeReadingReportMutation.isPending
                    ? 'loading'
                    : freeReadingReportQuery.isLoading && !freeReadingReportQuery.data
                      ? 'loading'
                      : generateFreeReadingReportMutation.isError || freeReadingReportQuery.isError || freeReadingReportQuery.data?.fetchStatus === 'FAILED' || freeReadingReportQuery.data?.lastRunStatus === 'FAILED'
                        ? 'error'
                        : freeReadingReportQuery.data?.fetchStatus === 'GENERATING'
                          ? 'loading'
                          : freeReadingReportQuery.data?.fetchStatus === 'READY'
                            ? 'success'
                            : 'idle'
                }
                report={freeReadingReportQuery.data ?? null}
                reportList={freeReadingReportsQuery.data ?? null}
                errorMessage={
                  generateFreeReadingReportMutation.isError
                    ? toUserMessage(generateFreeReadingReportMutation.error)
                  : freeReadingReportQuery.isError
                    ? toUserMessage(freeReadingReportQuery.error)
                    : freeReadingReportQuery.data?.lastRunStatus === 'FAILED'
                      ? '독서 리포트 생성에 실패했어요.'
                      : null
                }
                listErrorMessage={freeReadingReportsQuery.isError ? toUserMessage(freeReadingReportsQuery.error) : null}
                onClose={handleCloseFreeReportSection}
                onSelectReport={handleSelectFreeReport}
                onStartGenerate={handleStartFreeReportGeneration}
              />
            ) : null}

            {freeReadingReportSectionMode === 'list' ? (
              <FreeReadingReportListSection
                reportList={freeReadingReportsQuery.data ?? null}
                isLoading={freeReadingReportsQuery.isLoading}
                errorMessage={freeReadingReportsQuery.isError ? toUserMessage(freeReadingReportsQuery.error) : null}
                connected
                onSelectReport={handleSelectFreeReport}
              />
            ) : null}
          </ScrollView>
        </Animated.View>
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
  screenShell: { flex: 1, backgroundColor: '#111', position: 'relative' },
  edgeSwipeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 16,
    zIndex: 20,
  },
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, marginBottom: 20, marginTop: 4 },
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
  analysisMetaStrong: { fontSize: 18, color: '#111', fontWeight: '700' },
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
    backgroundColor: '#fff',
  },
  settingRowIconWrapDanger: {
    backgroundColor: '#f8e7e3',
  },
  settingRowIcon: { fontSize: 13, color: '#8d7f6f' },
  settingRowIconDanger: { color: '#d16456' },
  settingRowTitle: { fontSize: 13, color: '#111', fontWeight: '600' },
  settingRowTitleDanger: { color: '#d16456' },
  settingRowSub: { fontSize: 10, color: '#978c7d', marginTop: 3 },
  settingRight: { fontSize: 12, color: '#9a8f81' },
});

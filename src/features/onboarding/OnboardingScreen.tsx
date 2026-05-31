import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StepKey } from '../../app/types';

type Props = {
  step: number;
  stepKey: StepKey;
  totalSteps: number;
  nickname: string;
  bookTitle: string;
  author: string;
  selectedRecordOption: string;
  selectedMood: string;
  isNextDisabled: boolean;
  isAppleLoginLoading: boolean;
  appleLoginError: string | null;
  onNicknameChange: (value: string) => void;
  onBookTitleChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onRecordOptionChange: (value: string) => void;
  onMoodChange: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onAppleLoginPress: () => void;
};

export function OnboardingScreen(props: Props) {
  const {
    step,
    stepKey,
    totalSteps,
    nickname,
    bookTitle,
    author,
    selectedRecordOption,
    selectedMood,
    isNextDisabled,
    isAppleLoginLoading,
    appleLoginError,
    onNicknameChange,
    onBookTitleChange,
    onAuthorChange,
    onRecordOptionChange,
    onMoodChange,
    onPrev,
    onNext,
    onAppleLoginPress,
  } = props;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.topRule} />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {stepKey === 'intro' && (
            <View style={styles.centerBlock}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>📖</Text>
              </View>
              <Text style={styles.brandTitle}>ReBook</Text>
              <Text style={styles.bodyText}>책 속 문장을 기록하고,</Text>
              <Text style={styles.bodyText}>AI와 함께 다시 읽어보세요</Text>
            </View>
          )}

          {stepKey === 'nickname' && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconCircleSmall}>
                <Text style={styles.iconEmojiSmall}>👋</Text>
              </View>
              <Text style={styles.sectionTitle}>반가워요!</Text>
              <Text style={styles.sectionSubtitle}>ReBook에서 사용할 닉네임을 입력해주세요</Text>
              <TextInput
                style={styles.input}
                placeholder="닉네임을 입력하세요"
                placeholderTextColor="#aca396"
                value={nickname}
                onChangeText={onNicknameChange}
              />
            </View>
          )}

          {stepKey === 'book' && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconCircleSmall}>
                <Text style={styles.iconEmojiSmall}>📚</Text>
              </View>
              <Text style={styles.sectionTitle}>지금 기록하고 싶은 책이 있나요?</Text>
              <Text style={styles.sectionSubtitle}>책 정보를 입력하면 더 정확한 추천을 받을 수 있어요</Text>

              <View style={styles.optionColumn}>
                <OptionButton
                  label="지금 바로 책이 있어요"
                  active={selectedRecordOption === 'now'}
                  onPress={() => onRecordOptionChange('now')}
                />
                <OptionButton
                  label="다 읽은 책을 기록하고 싶어요"
                  active={selectedRecordOption === 'finished'}
                  onPress={() => onRecordOptionChange('finished')}
                />
                <OptionButton
                  label="아직 정하지 않았어요"
                  active={selectedRecordOption === 'later'}
                  onPress={() => onRecordOptionChange('later')}
                />
              </View>

              {selectedRecordOption === 'now' && (
                <View style={styles.formWrap}>
                  <Text style={styles.label}>책 제목</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="책 제목을 입력하세요"
                    placeholderTextColor="#aca396"
                    value={bookTitle}
                    onChangeText={onBookTitleChange}
                  />

                  <Text style={styles.label}>저자</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="저자를 입력하세요"
                    placeholderTextColor="#aca396"
                    value={author}
                    onChangeText={onAuthorChange}
                  />
                </View>
              )}
            </View>
          )}

          {stepKey === 'mood' && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconCircleSmall}>
                <Text style={styles.iconEmojiSmall}>✨</Text>
              </View>
              <Text style={styles.sectionTitle}>AI와 어떻게 대화하고 싶으세요?</Text>
              <Text style={styles.sectionSubtitle}>대화 스타일을 선택하면 더 잘 맞는 질문을 드려요</Text>

              <View style={styles.optionColumn}>
                <CardOption
                  emoji="😊"
                  title="친근하고 따뜻하게"
                  subtitle="편안한 톤의 코칭"
                  active={selectedMood === 'cozy'}
                  onPress={() => onMoodChange('cozy')}
                />
                <CardOption
                  emoji="🧠"
                  title="논리적이고 깊이 있게"
                  subtitle="생각을 확장하는 질문"
                  active={selectedMood === 'deep'}
                  onPress={() => onMoodChange('deep')}
                />
                <CardOption
                  emoji="⚡"
                  title="간결하고 명확하게"
                  subtitle="핵심만 짚어주는 대화"
                  active={selectedMood === 'short'}
                  onPress={() => onMoodChange('short')}
                />
              </View>
            </View>
          )}

          {stepKey === 'done' && (
            <View style={styles.centerBlock}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>✓</Text>
              </View>
              <Text style={styles.brandTitle}>준비 완료!</Text>
              <Text style={styles.bodyText}>이제 당신의 기록을</Text>
              <Text style={styles.bodyText}>ReBook과 함께 시작하세요</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {stepKey === 'intro' && appleLoginError ? <Text style={styles.errorText}>{appleLoginError}</Text> : null}
          <View style={styles.dotRow}>
            {[...Array(totalSteps)].map((_, index) => (
              <View key={index} style={[styles.dot, index === step && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.footerButtons}>
            {step > 0 ? (
              <TouchableOpacity onPress={onPrev} style={styles.ghostButton}>
                <Text style={styles.ghostText}>이전</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.ghostPlaceholder} />
            )}

            <TouchableOpacity
              onPress={stepKey === 'intro' ? onAppleLoginPress : onNext}
              disabled={stepKey === 'intro' ? isAppleLoginLoading : step !== totalSteps - 1 && isNextDisabled}
              style={[
                styles.primaryButton,
                (stepKey === 'intro' ? isAppleLoginLoading : step !== totalSteps - 1 && isNextDisabled) &&
                  styles.primaryButtonDisabled,
              ]}
            >
              <Text style={styles.primaryText}>
                {stepKey === 'intro'
                  ? isAppleLoginLoading
                    ? '로그인 중...'
                    : 'Apple로 시작하기'
                  : step === totalSteps - 1
                    ? 'ReBook 시작하기'
                    : '다음'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type OptionButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function OptionButton({ label, active, onPress }: OptionButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.optionBtn, active && styles.optionBtnActive]}>
      <Text style={[styles.optionBtnText, active && styles.optionBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

type CardOptionProps = {
  emoji: string;
  title: string;
  subtitle: string;
  active: boolean;
  onPress: () => void;
};

function CardOption({ emoji, title, subtitle, active, onPress }: CardOptionProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.cardOption, active && styles.cardOptionActive]}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <View style={styles.cardTextWrap}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f3ee' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  topRule: {
    width: '52%',
    borderTopWidth: 2,
    borderColor: '#8f7759',
    alignSelf: 'center',
    marginBottom: 14,
    opacity: 0.8,
  },
  content: { flex: 1 },
  contentContainer: { flexGrow: 1 },
  centerBlock: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  sectionBlock: { flex: 1, paddingTop: 12, paddingBottom: 16 },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ebe6dd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircleSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ebe6dd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  iconEmoji: { fontSize: 28 },
  iconEmojiSmall: { fontSize: 20 },
  brandTitle: { fontSize: 29, fontWeight: '700', color: '#2e2a24', marginBottom: 8 },
  bodyText: { fontSize: 14, color: '#6e675f', lineHeight: 22 },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    color: '#2f2a24',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: { fontSize: 13, color: '#8f877d', textAlign: 'center', marginBottom: 18 },
  optionColumn: { gap: 10, marginBottom: 16 },
  optionBtn: {
    backgroundColor: '#f0ece5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ebe4d8',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  optionBtnActive: { backgroundColor: '#8d7353', borderColor: '#8d7353' },
  optionBtnText: { color: '#5a5247', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  optionBtnTextActive: { color: '#fff' },
  formWrap: { marginTop: 2 },
  label: { fontSize: 12, color: '#6d655b', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#f0ece5',
    borderWidth: 1,
    borderColor: '#e7e0d3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#292522',
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f5ef',
    borderWidth: 1,
    borderColor: '#ebe4d8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cardOptionActive: { borderColor: '#8d7353', backgroundColor: '#f3ece1' },
  cardEmoji: { fontSize: 18, marginRight: 10 },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 14, color: '#2f2a24', fontWeight: '600', marginBottom: 3 },
  cardSubtitle: { fontSize: 12, color: '#7c7468' },
  footer: { marginTop: 8 },
  errorText: {
    color: '#cf4f4f',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  dotRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 14 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#d4cec2' },
  dotActive: { width: 18, backgroundColor: '#8d7353' },
  footerButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ghostButton: {
    minHeight: 48,
    minWidth: 74,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd3c5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#f5f1ea',
  },
  ghostText: { color: '#7a7267', fontWeight: '600', fontSize: 14 },
  ghostPlaceholder: { width: 74 },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonDisabled: { backgroundColor: '#cec5b8' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

import React, { useMemo, useState } from 'react';
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
import { AiStyle, OnboardingBookSearchItem } from './model/onboarding.types';

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
  isNicknameSaving: boolean;
  nicknameSaveError: string | null;
  isFirstBookSaving: boolean;
  firstBookSaveError: string | null;
  searchedBooks: OnboardingBookSearchItem[];
  isBookSearchLoading: boolean;
  bookSearchError: string | null;
  aiStyles: AiStyle[];
  isAiStylesLoading: boolean;
  aiStylesError: string | null;
  isAiStyleSaving: boolean;
  aiStyleSaveError: string | null;
  isCompleteSaving: boolean;
  completeSaveError: string | null;
  onNicknameChange: (value: string) => void;
  onBookTitleChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onBookSelect: (book: OnboardingBookSearchItem) => void;
  onRecordOptionChange: (value: string) => void;
  onMoodChange: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onAppleLoginPress: () => void;
  onRetryAiStyles: () => void;
};

type Theme = {
  background: string;
  panel: string;
  accent: string;
  accentDark: string;
  text: string;
  muted: string;
  input: string;
  inputBorder: string;
  button: string;
  buttonText: string;
  progress: string;
  progressSoft: string;
  progressText: string;
  statusBar: 'dark-content' | 'light-content';
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
    isNicknameSaving,
    nicknameSaveError,
    isFirstBookSaving,
    firstBookSaveError,
    searchedBooks,
    isBookSearchLoading,
    bookSearchError,
    aiStyles,
    isAiStylesLoading,
    aiStylesError,
    isAiStyleSaving,
    aiStyleSaveError,
    isCompleteSaving,
    completeSaveError,
    onNicknameChange,
    onBookTitleChange,
    onAuthorChange,
    onBookSelect,
    onRecordOptionChange,
    onMoodChange,
    onPrev,
    onNext,
    onAppleLoginPress,
    onRetryAiStyles,
  } = props;

  const [showBookResults, setShowBookResults] = useState(false);

  const theme = useMemo<Theme>(() => {
    if (stepKey === 'intro' || stepKey === 'done') {
      return {
        background: '#47c0f2',
        panel: '#ffffff',
        accent: '#0b0c0f',
        accentDark: '#111216',
        text: '#0b0c0f',
        muted: 'rgba(11, 12, 15, 0.72)',
        input: '#f5efe4',
        inputBorder: '#f5efe4',
        button: '#0b0c0f',
        buttonText: '#60e1ff',
        progress: '#0b0c0f',
        progressSoft: 'rgba(11, 12, 15, 0.2)',
        progressText: '#0b0c0f',
        statusBar: 'dark-content',
      };
    }

    return {
      background: '#f5f1ea',
      panel: '#ffffff',
      accent: '#47c0f2',
      accentDark: '#0b0c0f',
      text: '#2d241c',
      muted: '#7e7567',
      input: '#f2ede5',
      inputBorder: '#e4dacb',
      button: '#47c0f2',
      buttonText: '#0b0c0f',
      progress: '#8d7353',
      progressSoft: '#ded3c3',
      progressText: '#6c6256',
      statusBar: 'dark-content',
    };
  }, [stepKey]);

  const isBookStep = stepKey === 'book';
  const isIntroStep = stepKey === 'intro';
  const isMoodStep = stepKey === 'mood';
  const isDoneStep = stepKey === 'done';
  const canShowBookResults = isBookStep && showBookResults && (bookTitle.trim() || author.trim());

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} />
      <View style={styles.container}>
        <View style={styles.progressHeader}>
          <View style={styles.progressRail}>
            {[...Array(totalSteps)].map((_, index) => {
              const active = index === step;
              const done = index < step;
              return (
                <View
                  key={`step-${index}`}
                  style={[
                    styles.progressSegment,
                    { backgroundColor: done || active ? theme.progress : theme.progressSoft },
                    active && styles.progressSegmentActive,
                  ]}
                />
              );
            })}
          </View>
          <Text style={[styles.stepCount, { color: theme.progressText }]}>
            {String(step + 1).padStart(2, '0')}/{String(totalSteps).padStart(2, '0')}
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            (isIntroStep || isDoneStep) && styles.heroContent,
            isBookStep && styles.bookContent,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isIntroStep ? (
            <View style={styles.heroWrap}>
              <View style={styles.heroWordRow}>
                <Text style={styles.heroWord}>ReBook</Text>
                <Text style={styles.heroWordOutline}>ReBook</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeEmoji}>📖</Text>
              </View>
              <Text style={styles.heroTitle}>책 속 문장을 기록하고,</Text>
              <Text style={styles.heroTitle}>AI와 함께 다시 읽어보세요</Text>
              <Text style={styles.heroSubtitle}>책, 문장, 감정, 대화를 한 곳에 쌓는 기록형 독서 앱</Text>
              <View style={styles.heroNoteCard}>
                <Text style={styles.heroNoteTitle}>ReBook</Text>
                <Text style={styles.heroNoteBody}>당신의 문장을 더 선명하게 모아줍니다.</Text>
              </View>
            </View>
          ) : null}

          {stepKey === 'nickname' ? (
            <View style={styles.centerLayout}>
              <View style={[styles.stepCard, { backgroundColor: theme.panel }]}>
                <View style={[styles.iconBadge, { backgroundColor: theme.accent }]}>
                  <Text style={styles.iconBadgeEmoji}>👋</Text>
                </View>
                <Text style={styles.stepTitle}>반가워요!</Text>
                <Text style={styles.stepSubtitle}>ReBook에서 사용할 닉네임을 입력해주세요</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}
                  placeholder="닉네임을 입력하세요"
                  placeholderTextColor="#a79b8a"
                  value={nickname}
                  onChangeText={onNicknameChange}
                  maxLength={12}
                />
                <Text style={styles.counterText}>{nickname.trim().length}/12</Text>
              </View>
            </View>
          ) : null}

          {isBookStep ? (
            <View style={styles.bookLayout}>
              <View style={styles.bookIntroBlock}>
                <View style={[styles.iconBadge, { backgroundColor: theme.accent }]}>
                  <Text style={styles.iconBadgeEmoji}>📚</Text>
                </View>
                <Text style={styles.stepTitle}>지금 기록하고 싶은 책이 있나요?</Text>
                <Text style={styles.stepSubtitle}>책 정보를 입력하면 선택과 추천이 더 정확해져요</Text>
              </View>

              <View style={styles.optionStack}>
                <OptionButton
                  label="지금 바로 책이 있어요"
                  active={selectedRecordOption === 'now'}
                  onPress={() => onRecordOptionChange('now')}
                  activeBackground={theme.accent}
                  activeTextColor="#0b0c0f"
                />
                <OptionButton
                  label="다 읽은 책을 기록하고 싶어요"
                  active={selectedRecordOption === 'finished'}
                  onPress={() => onRecordOptionChange('finished')}
                  activeBackground="#ffffff"
                  activeTextColor="#0b0c0f"
                />
                <OptionButton
                  label="아직 정하지 않았어요"
                  active={selectedRecordOption === 'later'}
                  onPress={() => onRecordOptionChange('later')}
                  activeBackground="#ffffff"
                  activeTextColor="#0b0c0f"
                />
              </View>

              {(selectedRecordOption === 'now' || selectedRecordOption === 'finished') && (
                <View style={styles.bookFormCard}>
                  <Text style={styles.bookLabelDark}>책 제목</Text>
                  <TextInput
                    style={[styles.textInputDark, { backgroundColor: '#f6f2ea', borderColor: '#f6f2ea' }]}
                    placeholder="책 제목을 검색하세요"
                    placeholderTextColor="#8f8474"
                    value={bookTitle}
                    onChangeText={(value) => {
                      setShowBookResults(true);
                      onBookTitleChange(value);
                    }}
                  />

                  {canShowBookResults ? (
                    <View style={styles.searchResultsWrap}>
                      {isBookSearchLoading ? <Text style={styles.searchStateText}>검색 결과를 불러오는 중...</Text> : null}
                      {!isBookSearchLoading && bookSearchError ? (
                        <Text style={styles.searchErrorText}>{bookSearchError}</Text>
                      ) : null}
                      {!isBookSearchLoading && !bookSearchError && searchedBooks.length === 0 ? (
                        <Text style={styles.searchStateText}>검색 결과가 없어요.</Text>
                      ) : null}
                      {!isBookSearchLoading && !bookSearchError && searchedBooks.length > 0 ? (
                        <ScrollView style={styles.searchResultsList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                          {searchedBooks.map((book, index) => (
                            <TouchableOpacity
                              key={`${book.bookId ?? 'no-id'}-${book.title}-${book.author}-${index}`}
                              style={styles.searchResultItem}
                              onPress={() => {
                                setShowBookResults(false);
                                onBookSelect(book);
                              }}
                            >
                              <Text style={styles.searchResultTitle}>{book.title}</Text>
                              <Text style={styles.searchResultAuthor}>{book.author}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      ) : null}
                    </View>
                  ) : null}

                  <Text style={styles.bookLabelCyan}>저자</Text>
                  <TextInput
                    style={[styles.textInputDark, { backgroundColor: '#f6f2ea', borderColor: '#f6f2ea' }]}
                    placeholder="저자명을 입력하세요"
                    placeholderTextColor="#8f8474"
                    value={author}
                    onChangeText={(value) => {
                      setShowBookResults(true);
                      onAuthorChange(value);
                    }}
                  />
                </View>
              )}
            </View>
          ) : null}

          {isMoodStep ? (
            <View style={styles.centerLayout}>
              <View style={[styles.stepCard, { backgroundColor: theme.panel }]}>
                <View style={[styles.iconBadge, { backgroundColor: theme.accent }]}>
                  <Text style={styles.iconBadgeEmoji}>✨</Text>
                </View>
                <Text style={styles.stepTitle}>AI와 어떻게 대화하고 싶으세요?</Text>
                <Text style={styles.stepSubtitle}>대화 스타일을 선택하면 더 잘 맞는 질문을 드려요</Text>

                {isAiStylesLoading ? <Text style={styles.searchStateText}>AI 스타일을 불러오는 중...</Text> : null}

                {!isAiStylesLoading && aiStylesError ? (
                  <View style={styles.inlineCenter}>
                    <Text style={styles.searchErrorText}>{aiStylesError}</Text>
                    <TouchableOpacity onPress={onRetryAiStyles} style={styles.retryButton}>
                      <Text style={styles.retryButtonText}>다시 시도</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {!isAiStylesLoading && !aiStylesError && aiStyles.length === 0 ? (
                  <Text style={styles.searchStateText}>선택 가능한 AI 스타일이 없어요.</Text>
                ) : null}

                {!isAiStylesLoading && !aiStylesError && aiStyles.length > 0 ? (
                  <View style={styles.optionStack}>
                    {aiStyles.map((style) => (
                      <CardOption
                        key={style.styleCode}
                        emoji={getStyleEmoji(style.styleCode)}
                        title={style.styleName}
                        subtitle={getStyleSubtitle(style.styleCode)}
                        active={selectedMood === style.styleCode}
                        onPress={() => onMoodChange(style.styleCode)}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

          {isDoneStep ? (
            <View style={styles.heroWrap}>
              <View style={[styles.heroBadge, styles.heroBadgeDone]}>
                <Text style={styles.heroBadgeEmoji}>✓</Text>
              </View>
              <Text style={styles.heroTitle}>준비 완료!</Text>
              <Text style={styles.heroTitle}>이제 당신의 기록을 시작하세요</Text>
              <Text style={styles.heroSubtitle}>ReBook과 함께 문장과 생각을 차곡차곡 모아보세요</Text>
              <View style={styles.heroNoteCard}>
                <Text style={styles.heroNoteTitle}>ReBook Start</Text>
                <Text style={styles.heroNoteBody}>당신의 첫 기록을 기다리고 있어요.</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          {stepKey === 'intro' && appleLoginError ? <Text style={styles.errorText}>{appleLoginError}</Text> : null}
          {stepKey === 'nickname' && nicknameSaveError ? <Text style={styles.errorText}>{nicknameSaveError}</Text> : null}
          {stepKey === 'book' && firstBookSaveError ? <Text style={styles.errorText}>{firstBookSaveError}</Text> : null}
          {stepKey === 'mood' && aiStyleSaveError ? <Text style={styles.errorText}>{aiStyleSaveError}</Text> : null}
          {stepKey === 'done' && completeSaveError ? <Text style={styles.errorText}>{completeSaveError}</Text> : null}

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
              disabled={
                stepKey === 'intro'
                  ? isAppleLoginLoading
                  : stepKey === 'nickname'
                    ? isNicknameSaving || isNextDisabled
                    : stepKey === 'book'
                      ? isFirstBookSaving || isNextDisabled
                      : stepKey === 'mood'
                        ? isAiStyleSaving || isNextDisabled
                        : stepKey === 'done'
                          ? isCompleteSaving
                          : step !== totalSteps - 1 && isNextDisabled
              }
              style={[
                styles.primaryButton,
                {
                  backgroundColor: isIntroStep || isDoneStep ? theme.button : theme.accent,
                },
                (
                  stepKey === 'intro'
                    ? isAppleLoginLoading
                    : stepKey === 'nickname'
                      ? isNicknameSaving || isNextDisabled
                      : stepKey === 'book'
                        ? isFirstBookSaving || isNextDisabled
                        : stepKey === 'mood'
                          ? isAiStyleSaving || isNextDisabled
                          : stepKey === 'done'
                            ? isCompleteSaving
                            : step !== totalSteps - 1 && isNextDisabled
                ) && styles.primaryButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.primaryText,
                  {
                    color: isIntroStep || isDoneStep ? theme.buttonText : '#0b0c0f',
                  },
                ]}
              >
                {stepKey === 'intro'
                  ? isAppleLoginLoading
                    ? '로그인 중...'
                    : '시작하기'
                  : stepKey === 'nickname'
                    ? isNicknameSaving
                      ? '저장 중...'
                      : '다음'
                    : stepKey === 'book'
                      ? isFirstBookSaving
                        ? '저장 중...'
                        : '다음'
                      : stepKey === 'mood'
                        ? isAiStyleSaving
                          ? '저장 중...'
                          : '다음'
                        : stepKey === 'done'
                          ? isCompleteSaving
                            ? '완료 처리 중...'
                            : 'ReBook 시작하기'
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
  activeBackground: string;
  activeTextColor: string;
};

function OptionButton({ label, active, onPress, activeBackground, activeTextColor }: OptionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.optionBtn,
        active && { backgroundColor: activeBackground, borderColor: '#0b0c0f' },
      ]}
    >
      <Text style={[styles.optionBtnText, active && { color: activeTextColor }]}>{label}</Text>
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
      <View style={styles.cardEmojiBubble}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
      </View>
      <View style={styles.cardTextWrap}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function getStyleEmoji(styleCode: string): string {
  if (styleCode === 'FRIENDLY') return '😊';
  if (styleCode === 'DEEP') return '📚';
  if (styleCode === 'CLEAR') return '💬';
  return '✨';
}

function getStyleSubtitle(styleCode: string): string {
  if (styleCode === 'FRIENDLY') return '편안한 대화 스타일';
  if (styleCode === 'DEEP') return '분석적인 대화 스타일';
  if (styleCode === 'CLEAR') return '핵심만 간추린 스타일';
  return '원하는 대화 스타일';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 16 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  progressRail: { flex: 1, flexDirection: 'row', gap: 6, paddingRight: 12 },
  progressSegment: { flex: 1, height: 3, borderRadius: 999 },
  progressSegmentActive: { flex: 1.3 },
  stepCount: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  content: { flex: 1 },
  contentContainer: { flexGrow: 1, paddingBottom: 8 },
  heroContent: { justifyContent: 'center' },
  bookContent: { justifyContent: 'center' },
  heroWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  heroWordRow: { width: '100%', marginBottom: 14 },
  heroWord: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0b0c0f',
    letterSpacing: -1.2,
    textAlign: 'center',
  },
  heroWordOutline: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    fontSize: 32,
    fontWeight: '800',
    color: 'rgba(11, 12, 15, 0.18)',
    letterSpacing: -1.2,
    textAlign: 'center',
  },
  heroBadge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(11, 12, 15, 0.16)',
    marginBottom: 16,
  },
  heroBadgeDone: { backgroundColor: 'rgba(255,255,255,0.92)' },
  heroBadgeEmoji: { fontSize: 34, color: '#0b0c0f', fontWeight: '700' },
  heroTitle: {
    fontSize: 23,
    lineHeight: 31,
    fontWeight: '800',
    color: '#0b0c0f',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(11, 12, 15, 0.72)',
    textAlign: 'center',
    paddingHorizontal: 22,
  },
  heroNoteCard: {
    marginTop: 18,
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(11, 12, 15, 0.15)',
    backgroundColor: 'rgba(255,255,255,0.28)',
    padding: 14,
  },
  heroNoteTitle: { fontSize: 14, fontWeight: '800', color: '#0b0c0f', marginBottom: 4, textAlign: 'center' },
  heroNoteBody: { fontSize: 12, color: 'rgba(11,12,15,0.72)', textAlign: 'center' },
  centerLayout: { flex: 1, justifyContent: 'center' },
  stepCard: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#e6ddcf',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  iconBadgeEmoji: { fontSize: 24, color: '#0b0c0f' },
  stepTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
    color: '#221b15',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#7d7366',
    textAlign: 'center',
    marginBottom: 16,
  },
  textInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#221b15',
  },
  textInputDark: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#221b15',
  },
  counterText: { marginTop: 8, textAlign: 'right', color: '#8a8174', fontSize: 11, fontWeight: '600' },
  bookLayout: { flex: 1, justifyContent: 'center' },
  bookIntroBlock: { marginBottom: 14, alignItems: 'center' },
  optionStack: { gap: 10, marginBottom: 14 },
  optionBtn: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d8d0c3',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  optionBtnText: { color: '#0b0c0f', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bookFormCard: {
    borderRadius: 20,
    backgroundColor: '#0b0c0f',
    padding: 16,
    borderWidth: 1,
    borderColor: '#17181c',
  },
  bookLabelDark: { fontSize: 12, color: '#fff', fontWeight: '700', marginBottom: 8, marginTop: 2 },
  bookLabelCyan: { fontSize: 12, color: '#59c7f5', fontWeight: '700', marginBottom: 8, marginTop: 12 },
  searchResultsWrap: {
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1d1f23',
    backgroundColor: '#111217',
    paddingVertical: 4,
  },
  searchResultsList: { maxHeight: 164 },
  searchResultItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  searchResultTitle: { fontSize: 15, color: '#ffffff', fontWeight: '700', marginBottom: 3 },
  searchResultAuthor: { fontSize: 12, color: '#c9d1d9' },
  searchStateText: { color: '#d6dbe0', fontSize: 12, textAlign: 'center', paddingVertical: 10 },
  searchErrorText: { color: '#ff8e8e', fontSize: 12, textAlign: 'center', paddingVertical: 10 },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7dfd2',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cardOptionActive: { borderColor: '#47c0f2', backgroundColor: '#ebf9ff' },
  cardEmojiBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(71, 192, 242, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardEmoji: { fontSize: 18 },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 14, color: '#0b0c0f', fontWeight: '700', marginBottom: 3 },
  cardSubtitle: { fontSize: 12, color: '#6f675d' },
  inlineCenter: { alignItems: 'center', marginTop: 6 },
  retryButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#c8beaf',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f4efe7',
  },
  retryButtonText: { color: '#5f564b', fontWeight: '700', fontSize: 13 },
  footer: { marginTop: 8 },
  errorText: {
    color: '#cf4f4f',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  footerButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ghostButton: {
    minHeight: 50,
    minWidth: 74,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd3c5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  ghostText: { color: '#6b6258', fontWeight: '700', fontSize: 14 },
  ghostPlaceholder: { width: 74 },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryText: { color: '#0b0c0f', fontWeight: '800', fontSize: 15 },
});

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type StepKey = 'intro' | 'nickname' | 'book' | 'mood' | 'done';
type ScreenKey =
  | 'onboarding'
  | 'home'
  | 'quote-method'
  | 'camera-capture'
  | 'gallery-picker'
  | 'ocr-preview'
  | 'quote-form';
type HomeTabKey = 'all' | 'library' | 'insight';
type RegisterType = 'camera' | 'gallery' | 'manual';

const TOTAL_STEPS = 5;

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>('onboarding');
  const [step, setStep] = useState<number>(0);
  const [nickname, setNickname] = useState<string>('');
  const [bookTitle, setBookTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [selectedRecordOption, setSelectedRecordOption] = useState<string>('now');
  const [selectedMood, setSelectedMood] = useState<string>('cozy');
  const [homeTab, setHomeTab] = useState<HomeTabKey>('all');
  const [registerType, setRegisterType] = useState<RegisterType>('manual');

  const stepKey = useMemo<StepKey>(() => {
    if (step === 0) return 'intro';
    if (step === 1) return 'nickname';
    if (step === 2) return 'book';
    if (step === 3) return 'mood';
    return 'done';
  }, [step]);

  const goNext = () => {
    if (step === TOTAL_STEPS - 1) {
      setScreen('home');
      return;
    }
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  };
  const goPrev = () => setStep((prev) => Math.max(prev - 1, 0));

  const isNextDisabled =
    (stepKey === 'nickname' && nickname.trim().length < 2) ||
    (stepKey === 'book' && selectedRecordOption === 'now' && (!bookTitle.trim() || !author.trim()));

  if (screen === 'home') {
    return (
      <HomeScreen
        nickname={nickname}
        tab={homeTab}
        onChangeTab={setHomeTab}
        onPressRegister={() => setScreen('quote-method')}
      />
    );
  }

  if (screen === 'quote-method') {
    return (
      <QuoteMethodScreen
        nickname={nickname}
        tab={homeTab}
        onChangeTab={setHomeTab}
        onClose={() => setScreen('home')}
        onSelect={(type) => {
          setRegisterType(type);
          if (type === 'camera') setScreen('camera-capture');
          if (type === 'gallery') setScreen('gallery-picker');
          if (type === 'manual') setScreen('quote-form');
        }}
      />
    );
  }

  if (screen === 'camera-capture') {
    return (
      <CameraCaptureScreen
        onBack={() => setScreen('quote-method')}
        onCapture={() => setScreen('ocr-preview')}
      />
    );
  }

  if (screen === 'gallery-picker') {
    return <GalleryPickerScreen onBack={() => setScreen('quote-method')} onPick={() => setScreen('ocr-preview')} />;
  }

  if (screen === 'ocr-preview') {
    return (
      <OcrPreviewScreen
        onBack={() => setScreen(registerType === 'camera' ? 'camera-capture' : 'gallery-picker')}
        onNext={() => setScreen('quote-form')}
      />
    );
  }

  if (screen === 'quote-form') {
    return (
      <QuoteFormScreen
        onBack={() => setScreen('home')}
        initialMethod={registerType}
        ocrFilled={registerType === 'camera' || registerType === 'gallery'}
      />
    );
  }

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
                onChangeText={setNickname}
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
                  onPress={() => setSelectedRecordOption('now')}
                />
                <OptionButton
                  label="다 읽은 책을 기록하고 싶어요"
                  active={selectedRecordOption === 'finished'}
                  onPress={() => setSelectedRecordOption('finished')}
                />
                <OptionButton
                  label="아직 정하지 않았어요"
                  active={selectedRecordOption === 'later'}
                  onPress={() => setSelectedRecordOption('later')}
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
                    onChangeText={setBookTitle}
                  />

                  <Text style={styles.label}>저자</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="저자를 입력하세요"
                    placeholderTextColor="#aca396"
                    value={author}
                    onChangeText={setAuthor}
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
                  onPress={() => setSelectedMood('cozy')}
                />
                <CardOption
                  emoji="🧠"
                  title="논리적이고 깊이 있게"
                  subtitle="생각을 확장하는 질문"
                  active={selectedMood === 'deep'}
                  onPress={() => setSelectedMood('deep')}
                />
                <CardOption
                  emoji="⚡"
                  title="간결하고 명확하게"
                  subtitle="핵심만 짚어주는 대화"
                  active={selectedMood === 'short'}
                  onPress={() => setSelectedMood('short')}
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
          <View style={styles.dotRow}>
            {[...Array(TOTAL_STEPS)].map((_, index) => (
              <View key={index} style={[styles.dot, index === step && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.footerButtons}>
            {step > 0 ? (
              <TouchableOpacity onPress={goPrev} style={styles.ghostButton}>
                <Text style={styles.ghostText}>이전</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.ghostPlaceholder} />
            )}

            <TouchableOpacity
              onPress={goNext}
              disabled={step === TOTAL_STEPS - 1 ? false : isNextDisabled}
              style={[
                styles.primaryButton,
                (step !== TOTAL_STEPS - 1 && isNextDisabled) && styles.primaryButtonDisabled,
              ]}
            >
              <Text style={styles.primaryText}>{step === TOTAL_STEPS - 1 ? 'ReBook 시작하기' : '다음'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type HomeScreenProps = {
  nickname: string;
  tab: HomeTabKey;
  onChangeTab: (tab: HomeTabKey) => void;
  onPressRegister: () => void;
};

function HomeScreen({ nickname, tab, onChangeTab, onPressRegister }: HomeScreenProps) {
  const allNotes = [
    {
      id: '1',
      quote: '우리는 길을 잃음으로써 새로운 길을 배운다.',
      book: '데미안',
      author: '헤르만 헤세',
    },
    {
      id: '2',
      quote: '희망은 좋은 것이다. 아마 가장 좋은 것일지 모른다.',
      book: '쇼생크 탈출',
      author: '스티븐 킹',
    },
    {
      id: '3',
      quote: '나는 나에게 일어난 일의 희생자가 아니라 선택자다.',
      book: '인생수업',
      author: '엘리자베스 퀴블러 로스',
    },
  ];

  const insightNotes = [
    {
      id: '4',
      quote: '당신이 읽은 책은 결국 당신이 된다.',
      book: '독서의 기쁨',
      author: '수전 와이즈 바우어',
    },
    {
      id: '5',
      quote: '성장은 불편함과 함께 온다.',
      book: '아주 작은 습관의 힘',
      author: '제임스 클리어',
    },
  ];

  const list = tab === 'all' ? allNotes : tab === 'insight' ? insightNotes : [];
  const displayName = nickname.trim() ? nickname : 'User';

  return (
    <SafeAreaView style={styles.homeSafeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.homeContainer}>
        <View style={styles.homeHeader}>
          <Text style={styles.homeUsername}>{displayName} r...</Text>
        </View>

        <View style={styles.homeSearchRow}>
          <View style={styles.searchPill}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchText}>문장을 검색해보세요</Text>
          </View>
          <View style={styles.roundButton}>
            <Text style={styles.roundButtonText}>⌄</Text>
          </View>
        </View>

        <View style={styles.homeTabRow}>
          <HomeTabButton label="모두 보기" active={tab === 'all'} onPress={() => onChangeTab('all')} />
          <HomeTabButton label="내 도서관" active={tab === 'library'} onPress={() => onChangeTab('library')} />
          <HomeTabButton label="인사이트" active={tab === 'insight'} onPress={() => onChangeTab('insight')} />
        </View>

        {list.length > 0 ? (
          <ScrollView style={styles.homeList} showsVerticalScrollIndicator={false}>
            {list.map((item) => (
              <View key={item.id} style={styles.quoteCard}>
                <Text style={styles.quoteText}>{item.quote}</Text>
                <Text style={styles.quoteMeta}>
                  {item.book} · {item.author}
                </Text>
                <Text style={styles.quoteMark}>●</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyGrid}>
            {[...Array(4)].map((_, index) => (
              <View key={index} style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🗒️</Text>
                <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable style={styles.floatingButton} onPress={onPressRegister}>
          <Text style={styles.floatingButtonText}>＋</Text>
        </Pressable>

        <View style={styles.bottomNav}>
          <View style={styles.bottomItem}>
            <Text style={styles.bottomIcon}>⌂</Text>
            <Text style={styles.bottomLabelActive}>홈으로</Text>
          </View>
          <View style={styles.bottomItem}>
            <Text style={styles.bottomIcon}>◌</Text>
            <Text style={styles.bottomLabel}>채팅</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type QuoteMethodScreenProps = {
  nickname: string;
  tab: HomeTabKey;
  onChangeTab: (tab: HomeTabKey) => void;
  onClose: () => void;
  onSelect: (type: RegisterType) => void;
};

function QuoteMethodScreen({ nickname, tab, onChangeTab, onClose, onSelect }: QuoteMethodScreenProps) {
  return (
    <View style={styles.methodOverlay}>
      <HomeScreen nickname={nickname} tab={tab} onChangeTab={onChangeTab} onPressRegister={() => {}} />
      <Pressable style={styles.overlayDim} onPress={onClose} />
      <View style={styles.methodSheet}>
        <Text style={styles.methodTitle}>문장 등록 방식 선택</Text>
        <TouchableOpacity style={styles.methodItem} onPress={() => onSelect('camera')}>
          <Text style={styles.methodItemIcon}>📷</Text>
          <View>
            <Text style={styles.methodItemTitle}>사진 촬영</Text>
            <Text style={styles.methodItemSub}>책 페이지를 촬영하여 자동 인식</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.methodItem} onPress={() => onSelect('gallery')}>
          <Text style={styles.methodItemIcon}>🖼️</Text>
          <View>
            <Text style={styles.methodItemTitle}>이미지 첨부</Text>
            <Text style={styles.methodItemSub}>갤러리에서 사진 선택</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.methodItem} onPress={() => onSelect('manual')}>
          <Text style={styles.methodItemIcon}>✍️</Text>
          <View>
            <Text style={styles.methodItemTitle}>직접 입력</Text>
            <Text style={styles.methodItemSub}>문장을 직접 입력</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type CameraCaptureScreenProps = {
  onBack: () => void;
  onCapture: () => void;
};

function CameraCaptureScreen({ onBack, onCapture }: CameraCaptureScreenProps) {
  return (
    <SafeAreaView style={styles.captureSafeArea}>
      <View style={styles.captureTopBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cameraFrame}>
        <Text style={styles.cameraMockText}>카메라 프리뷰 (Mock)</Text>
        <View style={styles.scanGuide}>
          <Text style={styles.scanGuideText}>인식할 문장 영역에 맞춰 촬영하세요</Text>
        </View>
      </View>
      <View style={styles.captureBottomBar}>
        <TouchableOpacity style={styles.shutterButton} onPress={onCapture}>
          <Text style={styles.shutterIcon}>◉</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type GalleryPickerScreenProps = {
  onBack: () => void;
  onPick: () => void;
};

function GalleryPickerScreen({ onBack, onPick }: GalleryPickerScreenProps) {
  return (
    <SafeAreaView style={styles.gallerySafeArea}>
      <View style={styles.galleryTopBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.galleryTopText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.galleryTopText}>Photos</Text>
        <Text style={styles.galleryTopText}>Albums</Text>
      </View>
      <View style={styles.galleryGrid}>
        {[...Array(15)].map((_, index) => (
          <TouchableOpacity key={index} style={styles.galleryCell} onPress={onPick}>
            <Text style={styles.galleryCellText}>IMG {index + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

type OcrPreviewScreenProps = {
  onBack: () => void;
  onNext: () => void;
};

function OcrPreviewScreen({ onBack, onNext }: OcrPreviewScreenProps) {
  return (
    <SafeAreaView style={styles.formSafeArea}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>기록할 문장을 드래그해서 선택해주세요</Text>
        <View style={styles.formHeaderRight} />
      </View>
      <View style={styles.ocrCard}>
        <Text style={styles.ocrTextMuted}>모든 것이 흔들리던 밤이었다. 때리는 그리움 또한 흔들림 앞이었고, 한</Text>
        <Text style={styles.ocrTextHighlight}>우리는 말을 하면서 사유할 수 있다. 말은 생각을 반복시키고 선명하게 만든다.</Text>
        <Text style={styles.ocrTextMuted}>하지만 혼자서, 비유의 영역과 논리에만 갇힌 여전히 그 둘의 연결 고리로...</Text>
      </View>
      <TouchableOpacity style={styles.ocrNextButton} onPress={onNext}>
        <Text style={styles.ocrNextText}>다음</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

type QuoteFormScreenProps = {
  onBack: () => void;
  initialMethod: RegisterType;
  ocrFilled: boolean;
};

function QuoteFormScreen({ onBack, initialMethod, ocrFilled }: QuoteFormScreenProps) {
  const [book, setBook] = useState('책 제목을 입력하세요');
  const [page, setPage] = useState('23');
  const [quote, setQuote] = useState(
    ocrFilled ? '우리는 말을 하면서 사유할 수 있다. 말은 생각을 반복시킨다.' : '인상 깊은 문장을 입력하세요',
  );
  const [memo, setMemo] = useState('이 문장이 만든 생각을 자유롭게 적어보세요');
  const methodLabel = initialMethod === 'manual' ? '직접입력' : initialMethod === 'camera' ? '사진찍기' : '갤러리';

  return (
    <SafeAreaView style={styles.formSafeArea}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>문장 저장하기</Text>
        <View style={styles.formHeaderRight} />
      </View>
      <ScrollView contentContainerStyle={styles.formBody} showsVerticalScrollIndicator={false}>
        <Text style={styles.formLabel}>책 제목</Text>
        <TextInput style={styles.formInput} value={book} onChangeText={setBook} />
        <Text style={styles.formLabel}>페이지</Text>
        <TextInput style={styles.formInput} value={page} onChangeText={setPage} keyboardType="number-pad" />
        <Text style={styles.formLabel}>수집 문장</Text>
        <TextInput style={styles.formTextArea} value={quote} onChangeText={setQuote} multiline />
        <Text style={styles.formLabel}>내 코멘트 (선택)</Text>
        <TextInput style={styles.formTextArea} value={memo} onChangeText={setMemo} multiline />
        <Text style={styles.formLabel}>붙인 상태</Text>
        <View style={styles.tagRow}>
          <View style={styles.tagChipActive}>
            <Text style={styles.tagChipTextActive}>{methodLabel}</Text>
          </View>
          <View style={styles.tagChip}>
            <Text style={styles.tagChipText}>나중에 보기</Text>
          </View>
          <View style={styles.tagChip}>
            <Text style={styles.tagChipText}>사유중</Text>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>문장 저장하기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

type HomeTabButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function HomeTabButton({ label, active, onPress }: HomeTabButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.homeTabButton, active && styles.homeTabButtonActive]}>
      <Text style={[styles.homeTabText, active && styles.homeTabTextActive]}>{label}</Text>
    </TouchableOpacity>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f3ee',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  topRule: {
    width: '52%',
    borderTopWidth: 2,
    borderColor: '#8f7759',
    alignSelf: 'center',
    marginBottom: 14,
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  sectionBlock: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 16,
  },
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
  iconEmoji: {
    fontSize: 28,
  },
  iconEmojiSmall: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 29,
    fontWeight: '700',
    color: '#2e2a24',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: '#6e675f',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    color: '#2f2a24',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8f877d',
    textAlign: 'center',
    marginBottom: 18,
  },
  optionColumn: {
    gap: 10,
    marginBottom: 16,
  },
  optionBtn: {
    backgroundColor: '#f0ece5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ebe4d8',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  optionBtnActive: {
    backgroundColor: '#8d7353',
    borderColor: '#8d7353',
  },
  optionBtnText: {
    color: '#5a5247',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionBtnTextActive: {
    color: '#fff',
  },
  formWrap: {
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    color: '#6d655b',
    marginBottom: 6,
    marginTop: 10,
  },
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
  cardOptionActive: {
    borderColor: '#8d7353',
    backgroundColor: '#f3ece1',
  },
  cardEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: '#2f2a24',
    fontWeight: '600',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#7c7468',
  },
  footer: {
    marginTop: 8,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#d4cec2',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#8d7353',
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
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
  ghostText: {
    color: '#7a7267',
    fontWeight: '600',
    fontSize: 14,
  },
  ghostPlaceholder: {
    width: 74,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonDisabled: {
    backgroundColor: '#cec5b8',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  homeSafeArea: {
    flex: 1,
    backgroundColor: '#f6f3ee',
  },
  homeContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  homeHeader: {
    marginBottom: 10,
  },
  homeUsername: {
    fontSize: 38,
    letterSpacing: -0.8,
    color: '#746d63',
    fontWeight: '700',
  },
  homeSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchPill: {
    flex: 1,
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: '#efe9df',
    borderWidth: 1,
    borderColor: '#e2d9cc',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 13,
    color: '#948878',
    marginRight: 6,
  },
  searchText: {
    fontSize: 11,
    color: '#9f968a',
  },
  roundButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButtonText: {
    color: '#fff',
    fontSize: 14,
    marginTop: -1,
  },
  homeTabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  homeTabButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4dbce',
    backgroundColor: '#f4efe7',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  homeTabButtonActive: {
    backgroundColor: '#8d7353',
    borderColor: '#8d7353',
  },
  homeTabText: {
    color: '#7b7369',
    fontSize: 11,
    fontWeight: '600',
  },
  homeTabTextActive: {
    color: '#fff',
  },
  homeList: {
    flex: 1,
  },
  quoteCard: {
    backgroundColor: '#f9f6f0',
    borderWidth: 1,
    borderColor: '#ece4d9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 13,
    color: '#322d27',
    lineHeight: 19,
    marginBottom: 9,
  },
  quoteMeta: {
    fontSize: 10,
    color: '#8b8173',
  },
  quoteMark: {
    position: 'absolute',
    right: 10,
    bottom: 8,
    color: '#e6b545',
    fontSize: 11,
  },
  emptyGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
    rowGap: 10,
    paddingTop: 4,
  },
  emptyCard: {
    width: '48.4%',
    aspectRatio: 0.93,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ece4d8',
    backgroundColor: '#f7f3ec',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 10,
    color: '#998f83',
  },
  floatingButton: {
    position: 'absolute',
    right: 18,
    bottom: 58,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#8d7353',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 18,
    marginTop: -1,
  },
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
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomIcon: {
    fontSize: 14,
    color: '#8f8578',
    marginBottom: 1,
  },
  bottomLabel: {
    fontSize: 10,
    color: '#92897d',
  },
  bottomLabelActive: {
    fontSize: 10,
    color: '#8d7353',
    fontWeight: '700',
  },
  methodOverlay: {
    flex: 1,
    backgroundColor: '#f6f3ee',
  },
  overlayDim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  methodSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f7f2ea',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 8,
  },
  methodTitle: {
    fontSize: 14,
    color: '#4d4439',
    fontWeight: '700',
    marginBottom: 2,
  },
  methodItem: {
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#f9f5ee',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  methodItemIcon: {
    fontSize: 15,
  },
  methodItemTitle: {
    fontSize: 13,
    color: '#312c25',
    fontWeight: '600',
  },
  methodItemSub: {
    fontSize: 11,
    color: '#8a8074',
    marginTop: 2,
  },
  captureSafeArea: {
    flex: 1,
    backgroundColor: '#f5f2eb',
  },
  captureTopBar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backText: {
    fontSize: 18,
    color: '#453d33',
  },
  cameraFrame: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#d8d2c8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cameraMockText: {
    fontSize: 13,
    color: '#7a7062',
    marginBottom: 10,
  },
  scanGuide: {
    width: '84%',
    borderRadius: 8,
    backgroundColor: 'rgba(126, 183, 108, 0.5)',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  scanGuideText: {
    textAlign: 'center',
    color: '#22301d',
    fontSize: 12,
    fontWeight: '600',
  },
  captureBottomBar: {
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterIcon: {
    fontSize: 26,
    color: '#8d7353',
  },
  gallerySafeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  galleryTopBar: {
    height: 44,
    borderBottomWidth: 1,
    borderColor: '#ececec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  galleryTopText: {
    color: '#2f6fe0',
    fontSize: 13,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  galleryCell: {
    width: '25%',
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: '#eaeaea',
    backgroundColor: '#ddd6ca',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryCellText: {
    fontSize: 10,
    color: '#675f55',
  },
  formSafeArea: {
    flex: 1,
    backgroundColor: '#f6f3ee',
  },
  formHeader: {
    height: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formHeaderTitle: {
    fontSize: 14,
    color: '#3a3228',
    fontWeight: '600',
  },
  formHeaderRight: {
    width: 18,
  },
  ocrCard: {
    flex: 1,
    marginHorizontal: 14,
    marginTop: 8,
    backgroundColor: '#fbf8f2',
    borderWidth: 1,
    borderColor: '#e9dfd0',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  ocrTextMuted: {
    fontSize: 12,
    color: '#72695e',
    lineHeight: 18,
  },
  ocrTextHighlight: {
    fontSize: 12,
    color: '#3f3a30',
    lineHeight: 18,
    backgroundColor: 'rgba(163, 216, 146, 0.55)',
    paddingVertical: 3,
  },
  ocrNextButton: {
    height: 44,
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 9,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ocrNextText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  formBody: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  formLabel: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 11,
    color: '#746b5f',
    fontWeight: '600',
  },
  formInput: {
    height: 38,
    borderRadius: 8,
    backgroundColor: '#f1ede5',
    borderWidth: 1,
    borderColor: '#e4dbcd',
    paddingHorizontal: 10,
    color: '#3e352b',
    fontSize: 12,
  },
  formTextArea: {
    minHeight: 76,
    borderRadius: 8,
    backgroundColor: '#f1ede5',
    borderWidth: 1,
    borderColor: '#e4dbcd',
    paddingHorizontal: 10,
    paddingTop: 10,
    color: '#3e352b',
    fontSize: 12,
    textAlignVertical: 'top',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e1d7c9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#f8f5ee',
  },
  tagChipActive: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8d7353',
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#8d7353',
  },
  tagChipText: {
    fontSize: 10,
    color: '#7f766a',
  },
  tagChipTextActive: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    height: 44,
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 9,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

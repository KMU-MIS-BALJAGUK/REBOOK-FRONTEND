import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RegisterType } from '../../../app/types';
import { toUserMessage } from '../../../shared/utils/apiError';
import { QuoteImageAttachmentResult } from '../model/quoteImageAttachment.types';
import { QuoteLocalImageAsset } from '../model/quoteLocalImage.types';
import { useCreateFolder } from '../hooks/useCreateFolder';
import { useQuoteBookSearch } from '../hooks/useQuoteBookSearch';
import { useCreateQuote } from '../hooks/useCreateQuote';
import { useFolders } from '../hooks/useFolders';
import { CameraCropScreen } from './CameraCropScreen';
import { CreateQuoteResult } from '../model/quoteCreate.types';

type Props = {
  onBack: () => void;
  onSaved: (result: CreateQuoteResult) => void;
  initialMethod: RegisterType;
  initialQuoteText?: string;
  ocrSource?: {
    imageId: number;
    ocrId: number;
    blockIds?: number[];
  };
  onAttachImage: (asset: QuoteLocalImageAsset) => Promise<QuoteImageAttachmentResult | null>;
};

type AttachedOcrSource = {
  imageId: number;
  ocrId: number;
  blockIds?: number[];
  fullText?: string;
};

export function QuoteFormScreen({ onBack, onSaved, initialMethod, initialQuoteText, ocrSource, onAttachImage }: Props) {
  const createQuoteMutation = useCreateQuote();
  const createFolderMutation = useCreateFolder();
  const foldersQuery = useFolders({ includeQuoteCount: true });
  const formScrollRef = useRef<ScrollView | null>(null);
  const bookInputRef = useRef<TextInput | null>(null);
  const authorInputRef = useRef<TextInput | null>(null);
  const pageInputRef = useRef<TextInput | null>(null);
  const quoteInputRef = useRef<TextInput | null>(null);
  const memoInputRef = useRef<TextInput | null>(null);
  const folderInputRef = useRef<TextInput | null>(null);
  const [book, setBook] = useState('');
  const [author, setAuthor] = useState('');
  const [bookCoverImageUrl, setBookCoverImageUrl] = useState<string | null>(null);
  const [showBookResults, setShowBookResults] = useState(false);
  const [page, setPage] = useState('');
  const [quote, setQuote] = useState(initialQuoteText ?? '');
  const [memo, setMemo] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [pendingAttachmentAsset, setPendingAttachmentAsset] = useState<QuoteLocalImageAsset | null>(null);
  const [isAttachmentSubmitting, setIsAttachmentSubmitting] = useState(false);
  const [validationErrorField, setValidationErrorField] = useState<'book' | 'author' | 'page' | 'quote' | null>(null);
  const [validationErrorMessage, setValidationErrorMessage] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<AttachedOcrSource | null>(
    ocrSource ? { ...ocrSource, fullText: initialQuoteText ?? '' } : null,
  );
  const methodLabel = initialMethod === 'manual' ? '직접입력' : initialMethod === 'camera' ? '사진찍기' : '갤러리';
  const apiError = createQuoteMutation.isError ? toUserMessage(createQuoteMutation.error) : null;
  const isSubmitDisabled = createQuoteMutation.isPending || createFolderMutation.isPending;
  const deferredBook = useDeferredValue(book);
  const deferredAuthor = useDeferredValue(author);
  const bookSearchQuery = deferredBook.trim() || deferredAuthor.trim();
  const quoteBookSearchQuery = useQuoteBookSearch(bookSearchQuery, bookSearchQuery.length > 0);
  const createFolderError = createFolderMutation.isError ? toUserMessage(createFolderMutation.error) : null;
  const bookSearchError = quoteBookSearchQuery.isError ? toUserMessage(quoteBookSearchQuery.error) : null;
  const edgeSwipeTranslateX = useRef(new Animated.Value(0)).current;
  const edgeSwipeStartX = useRef(0);
  const edgeSwipeAnimating = useRef(false);
  const quoteOcrSource = attachedImage
    ? {
        imageId: attachedImage.imageId,
        ocrId: attachedImage.ocrId,
        blockIds: attachedImage.blockIds,
      }
    : undefined;

  useEffect(() => {
    if (ocrSource) {
      setAttachedImage({ ...ocrSource, fullText: initialQuoteText ?? '' });
    }
  }, [initialQuoteText, ocrSource]);

  useEffect(() => {
    if (!book.trim() && !author.trim()) {
      setShowBookResults(false);
    }
  }, [author, book]);

  useEffect(() => {
    if (validationErrorField === 'book' && book.trim()) {
      setValidationErrorField(null);
      setValidationErrorMessage(null);
    }
  }, [book, validationErrorField]);

  useEffect(() => {
    if (validationErrorField === 'author' && author.trim()) {
      setValidationErrorField(null);
      setValidationErrorMessage(null);
    }
  }, [author, validationErrorField]);

  useEffect(() => {
    if (validationErrorField === 'page' && page.trim()) {
      setValidationErrorField(null);
      setValidationErrorMessage(null);
    }
  }, [page, validationErrorField]);

  useEffect(() => {
    if (validationErrorField === 'quote' && quote.trim()) {
      setValidationErrorField(null);
      setValidationErrorMessage(null);
    }
  }, [quote, validationErrorField]);

  const resetEdgeSwipe = () => {
    Animated.spring(edgeSwipeTranslateX, {
      toValue: 0,
      friction: 9,
      tension: 80,
      useNativeDriver: true,
    }).start(() => {
      edgeSwipeAnimating.current = false;
    });
  };

  const dismissEdgeSwipe = () => {
    edgeSwipeAnimating.current = true;
    Keyboard.dismiss();
    Animated.timing(edgeSwipeTranslateX, {
      toValue: 110,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      edgeSwipeAnimating.current = false;
      edgeSwipeTranslateX.setValue(0);
      onBack();
    });
  };

  const edgeSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_, gestureState) => gestureState.x0 <= 28 && !edgeSwipeAnimating.current,
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          if (edgeSwipeAnimating.current) {
            return false;
          }
          if (gestureState.x0 > 28) {
            return false;
          }

          const absDx = Math.abs(gestureState.dx);
          const absDy = Math.abs(gestureState.dy);
          return gestureState.dx > 8 && absDx > absDy * 1.08;
        },
        onPanResponderGrant: () => {
          edgeSwipeTranslateX.stopAnimation((value) => {
            edgeSwipeStartX.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const next = Math.max(0, edgeSwipeStartX.current + gestureState.dx);
          edgeSwipeTranslateX.setValue(Math.min(next, 110));
        },
        onPanResponderRelease: (_, gestureState) => {
          const threshold = 110 * 0.2;
          if (gestureState.dx >= threshold) {
            dismissEdgeSwipe();
            return;
          }
          resetEdgeSwipe();
        },
        onPanResponderTerminate: () => {
          resetEdgeSwipe();
        },
      }),
    [edgeSwipeTranslateX],
  );

  const handleSubmit = () => {
    const trimmedBook = book.trim();
    const trimmedAuthor = author.trim();
    const trimmedQuote = quote.trim();
    const pageNumber = Number(page.trim());

    if (!trimmedBook) {
      setValidationErrorField('book');
      setValidationErrorMessage('책 제목을 입력해주세요.');
      setTimeout(() => {
        bookInputRef.current?.focus();
      }, 0);
      return;
    }

    if (!trimmedAuthor) {
      setValidationErrorField('author');
      setValidationErrorMessage('저자를 입력해주세요.');
      setTimeout(() => {
        authorInputRef.current?.focus();
      }, 0);
      return;
    }

    if (!trimmedQuote) {
      setValidationErrorField('quote');
      setValidationErrorMessage('문장을 입력해주세요.');
      setTimeout(() => {
        quoteInputRef.current?.focus();
      }, 0);
      return;
    }

    if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
      setValidationErrorField('page');
      setValidationErrorMessage('페이지는 1 이상의 숫자로 입력해주세요.');
      setTimeout(() => {
        pageInputRef.current?.focus();
      }, 0);
      return;
    }

    setValidationErrorField(null);
    setValidationErrorMessage(null);
    createQuoteMutation.mutate(
      {
        bookTitle: trimmedBook,
        author: trimmedAuthor,
        coverImageUrl: bookCoverImageUrl ?? undefined,
        pageNumber,
        quoteText: trimmedQuote,
        memo: memo.trim() ? memo.trim() : undefined,
        folderId: selectedFolderId ?? undefined,
        registerType: initialMethod,
        ocrSource: quoteOcrSource,
      },
      {
        onSuccess: (result) => {
          onSaved(result);
        },
      },
    );
  };

  const handleCreateFolder = async () => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) {
      setFolderError('폴더 이름을 입력해주세요.');
      return;
    }
    if (trimmedName.length > 20) {
      setFolderError('폴더 이름은 20자 이하로 입력해주세요.');
      return;
    }

    setFolderError(null);
    try {
      const createdFolder = await createFolderMutation.mutateAsync({ folderName: trimmedName });
      setSelectedFolderId(createdFolder.folderId);
      setNewFolderName('');
      setIsCreatingFolder(false);
      Keyboard.dismiss();
      await foldersQuery.refetch();
    } catch {
      // The mutation error is rendered from createFolderMutation below.
    }
  };

  const handleAttachImage = async () => {
    setAttachmentError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setAttachmentError('사진 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setPendingAttachmentAsset(result.assets[0]);
    } catch (error) {
      setAttachmentError(toUserMessage(error));
    }
  };

  const handleRemoveAttachment = () => {
    setAttachedImage(null);
    setAttachmentError(null);
  };

  const finishInput = () => {
    Keyboard.dismiss();
  };

  const handleInputFocus = (label: string, scrollToBottom = false) => {
    if (!scrollToBottom) {
      return;
    }

    setTimeout(() => {
      formScrollRef.current?.scrollToEnd({ animated: true });
    }, Platform.OS === 'ios' ? 280 : 180);
  };

  if (pendingAttachmentAsset) {
    return (
      <CameraCropScreen
        asset={pendingAttachmentAsset}
        onBack={() => {
          setAttachmentError(null);
          setPendingAttachmentAsset(null);
        }}
        isSubmitting={isAttachmentSubmitting}
        submitError={attachmentError}
        onConfirm={async (asset) => {
          try {
            setAttachmentError(null);
            setIsAttachmentSubmitting(true);
            const result = await onAttachImage(asset);
            if (result) {
              setAttachedImage(result);
              setQuote(result.fullText);
            }
            setPendingAttachmentAsset(null);
          } catch (error) {
            setAttachmentError(toUserMessage(error));
          } finally {
            setIsAttachmentSubmitting(false);
          }
        }}
      />
    );
  }

  return (
    <Animated.View style={[styles.formScreen, { transform: [{ translateX: edgeSwipeTranslateX }] }]}>
      <SafeAreaView style={styles.formSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#44c3f3" />
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.formHeaderTitle}>문장 저장하기</Text>
          <View style={styles.formHeaderRight} />
        </View>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={formScrollRef}
            style={styles.formScroll}
            contentContainerStyle={styles.formBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          >
        <Text style={styles.formLabel}>책 제목</Text>
        <TextInput
          ref={bookInputRef}
          style={[styles.formInput, validationErrorField === 'book' && styles.formInputError]}
          value={book}
          onChangeText={(value) => {
            setShowBookResults(true);
            setBookCoverImageUrl(null);
            setBook(value);
          }}
          placeholder="책 제목을 입력하세요"
          onFocus={() => handleInputFocus('책 제목')}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={finishInput}
          />
        {validationErrorField === 'book' ? <Text style={styles.fieldErrorText}>{validationErrorMessage}</Text> : null}
        {showBookResults && (book.trim() || author.trim()) ? (
          <View style={styles.searchResultsWrap}>
            {quoteBookSearchQuery.isLoading ? <Text style={styles.helperText}>검색 결과를 불러오는 중...</Text> : null}
            {!quoteBookSearchQuery.isLoading && bookSearchError ? <Text style={styles.errorText}>{bookSearchError}</Text> : null}
            {!quoteBookSearchQuery.isLoading && !bookSearchError && (quoteBookSearchQuery.data?.books ?? []).length === 0 ? (
              <Text style={styles.helperText}>검색 결과가 없어요.</Text>
            ) : null}
            {!quoteBookSearchQuery.isLoading && !bookSearchError && (quoteBookSearchQuery.data?.books ?? []).length > 0 ? (
              <ScrollView style={styles.searchResultsList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {(quoteBookSearchQuery.data?.books ?? []).map((searchedBook, index) => (
                  <TouchableOpacity
                    key={`${searchedBook.bookId ?? 'no-id'}-${searchedBook.title}-${searchedBook.author}-${index}`}
                    style={styles.searchResultItem}
                    onPress={() => {
                      setBook(searchedBook.title);
                      setAuthor(searchedBook.author);
                      setBookCoverImageUrl(searchedBook.coverImageUrl);
                      setShowBookResults(false);
                    }}
                  >
                    <Text style={styles.searchResultTitle}>{searchedBook.title}</Text>
                    <Text style={styles.searchResultAuthor}>{searchedBook.author}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
          </View>
        ) : null}
        <Text style={styles.formLabel}>저자</Text>
        <TextInput
          ref={authorInputRef}
          style={[styles.formInput, validationErrorField === 'author' && styles.formInputError]}
          value={author}
          onChangeText={(value) => {
            setShowBookResults(true);
            setBookCoverImageUrl(null);
            setAuthor(value);
          }}
          placeholder="저자를 입력하세요"
          onFocus={() => handleInputFocus('저자')}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={finishInput}
        />
        {validationErrorField === 'author' ? <Text style={styles.fieldErrorText}>{validationErrorMessage}</Text> : null}
        <Text style={styles.formLabel}>페이지</Text>
        <TextInput
          ref={pageInputRef}
          style={[styles.formInput, validationErrorField === 'page' && styles.formInputError]}
          value={page}
          onChangeText={setPage}
          keyboardType="number-pad"
          placeholder="페이지 번호"
          onFocus={() => handleInputFocus('페이지')}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={finishInput}
        />
        {validationErrorField === 'page' ? <Text style={styles.fieldErrorText}>{validationErrorMessage}</Text> : null}
        <Text style={styles.formLabel}>{initialMethod === 'manual' ? '인상 깊은 문장' : '추출된 문장'}</Text>
        {initialMethod === 'manual' ? null : (
          <>
            <View style={styles.quoteAttachmentHeader}>
              <Text style={styles.quoteAttachmentHeaderText}>이미지 첨부</Text>
              <TouchableOpacity style={styles.quoteAttachButton} onPress={() => void handleAttachImage()}>
                <Text style={styles.quoteAttachButtonText}>갤러리에서 선택</Text>
              </TouchableOpacity>
            </View>
            {attachedImage ? (
              <View style={styles.attachmentCard}>
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentTitle}>이미지 첨부됨</Text>
                  <Text style={styles.attachmentSub}>OCR 결과를 문장 칸에 반영했어요.</Text>
                </View>
                <TouchableOpacity onPress={handleRemoveAttachment}>
                  <Text style={styles.attachmentRemoveText}>삭제</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {attachmentError ? <Text style={styles.errorText}>{attachmentError}</Text> : null}
          </>
        )}
        <TextInput
          ref={quoteInputRef}
          style={[styles.formTextArea, styles.quoteTextArea, validationErrorField === 'quote' && styles.formTextAreaError]}
          value={quote}
          onChangeText={setQuote}
          multiline
          placeholder="인상 깊은 문장을 입력하세요"
          onFocus={() => handleInputFocus('추출된 문장')}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={finishInput}
        />
        {validationErrorField === 'quote' ? <Text style={styles.fieldErrorText}>{validationErrorMessage}</Text> : null}
        <Text style={styles.formLabel}>내 코멘트 (선택)</Text>
        <TextInput
          ref={memoInputRef}
          style={[styles.formTextArea, styles.memoTextArea]}
          value={memo}
          onChangeText={setMemo}
          multiline
          placeholder="이 문장이 만든 생각을 자유롭게 적어보세요"
          onFocus={() => handleInputFocus('내 코멘트', true)}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={finishInput}
        />
        <Text style={styles.formLabel}>폴더 선택</Text>
        <View style={styles.tagRow}>
          {foldersQuery.isLoading ? (
            <Text style={styles.helperText}>폴더를 불러오는 중...</Text>
          ) : foldersQuery.isError ? (
            <View style={styles.inlineRow}>
              <Text style={styles.errorTextInline}>폴더 조회에 실패했어요.</Text>
              <TouchableOpacity onPress={() => void foldersQuery.refetch()}>
                <Text style={styles.retryText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : (foldersQuery.data ?? []).length === 0 ? (
            <View style={styles.emptyFolderWrap}>
              <Text style={styles.helperText}>등록된 폴더가 없어요.</Text>
              <TouchableOpacity
                style={styles.createEmptyFolderButton}
                onPress={() => {
                  setFolderError(null);
                  setIsCreatingFolder(true);
                  setTimeout(() => {
                    formScrollRef.current?.scrollToEnd({ animated: true });
                  }, 120);
                }}
              >
                <Text style={styles.createEmptyFolderButtonText}>새 폴더 만들기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {(foldersQuery.data ?? []).map((folder) => {
                const selected = selectedFolderId === folder.folderId;
                return (
                  <TouchableOpacity
                    key={folder.folderId}
                    style={selected ? styles.tagChipActive : styles.tagChip}
                    onPress={() => setSelectedFolderId((prev) => (prev === folder.folderId ? null : folder.folderId))}
                  >
                    <Text style={selected ? styles.tagChipTextActive : styles.tagChipText}>
                      {folder.folderName}
                      {typeof folder.quoteCount === 'number' ? ` (${folder.quoteCount})` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.tagChip} onPress={() => setIsCreatingFolder((prev) => !prev)}>
                <Text style={styles.tagChipText}>+ 새 폴더</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {isCreatingFolder ? (
          <View style={styles.createFolderContainer}>
            <TextInput
              ref={folderInputRef}
              style={styles.formInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="새 폴더 이름 (최대 20자)"
              maxLength={20}
              onFocus={() => handleInputFocus('새 폴더 이름', true)}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => void handleCreateFolder()}
            />
            <TouchableOpacity
              style={[styles.createFolderButton, createFolderMutation.isPending && styles.submitButtonDisabled]}
              disabled={createFolderMutation.isPending}
              onPress={() => void handleCreateFolder()}
            >
              {createFolderMutation.isPending ? (
                <ActivityIndicator color="#44c3f3" size="small" />
              ) : (
                <Text style={styles.createFolderButtonText}>폴더 생성</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
        {folderError ? <Text style={styles.errorText}>{folderError}</Text> : null}
        {createFolderError ? <Text style={styles.errorText}>{createFolderError}</Text> : null}
        <Text style={styles.formLabel}>등록 방식</Text>
        <View style={styles.tagRow}>
          <View style={styles.tagChipActive}>
            <Text style={styles.tagChipTextActive}>{methodLabel}</Text>
          </View>
        </View>
        {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
          </ScrollView>
          <View style={styles.submitBar}>
            <TouchableOpacity style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]} disabled={isSubmitDisabled} onPress={handleSubmit}>
              {createQuoteMutation.isPending ? (
                <ActivityIndicator color="#0d0d0d" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>문장 저장하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <View style={styles.edgeSwipeZone} {...edgeSwipeResponder.panHandlers} />
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  formScreen: {
    flex: 1,
    backgroundColor: '#44c3f3',
  },
  formSafeArea: { flex: 1, backgroundColor: '#44c3f3' },
  formHeader: {
    height: 62,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#44c3f3',
    borderBottomWidth: 1,
    borderBottomColor: '#0d0d0d',
  },
  backText: { fontSize: 21, color: '#0d0d0d', fontWeight: '700' },
  formHeaderTitle: { fontSize: 17, color: '#0d0d0d', fontWeight: '900' },
  formHeaderRight: { width: 21 },
  keyboardAvoidingView: { flex: 1, backgroundColor: '#fff' },
  formScroll: { flex: 1, backgroundColor: '#fff' },
  formBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: '#fff',
  },
  formLabel: { marginTop: 14, marginBottom: 8, fontSize: 12, color: '#0d0d0d', fontWeight: '800' },
  formInput: {
    height: 46,
    borderRadius: 0,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    paddingHorizontal: 14,
    color: '#0d0d0d',
    fontSize: 14,
  },
  formInputError: {
    borderColor: '#b14f4f',
    backgroundColor: '#fff6f6',
  },
  searchResultsWrap: {
    marginTop: 8,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#fff',
    padding: 8,
  },
  quoteAttachmentHeader: {
    marginTop: 2,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  quoteAttachmentHeaderText: {
    fontSize: 11,
    color: '#0d0d0d',
    fontWeight: '700',
  },
  quoteAttachButton: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#7fd0ee',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quoteAttachButtonText: {
    fontSize: 11,
    color: '#0d0d0d',
    fontWeight: '800',
  },
  attachmentCard: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#e6f5fa',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  attachmentInfo: {
    flex: 1,
    gap: 2,
  },
  attachmentTitle: {
    fontSize: 12,
    color: '#0d0d0d',
    fontWeight: '800',
  },
  attachmentSub: {
    fontSize: 11,
    color: '#5f6c71',
  },
  attachmentRemoveText: {
    fontSize: 11,
    color: '#b14f4f',
    fontWeight: '700',
  },
  searchResultsList: {
    maxHeight: 180,
  },
  searchResultItem: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  searchResultTitle: {
    color: '#111',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  searchResultAuthor: {
    color: '#626262',
    fontSize: 12,
  },
  formTextArea: {
    minHeight: 90,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    color: '#0d0d0d',
    fontSize: 14,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  formTextAreaError: {
    borderColor: '#b14f4f',
    backgroundColor: '#fff6f6',
  },
  quoteTextArea: {
    minHeight: 96,
    backgroundColor: '#44c3f3',
    fontWeight: '700',
    shadowColor: '#0d0d0d',
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 4 },
    elevation: 3,
  },
  memoTextArea: {
    minHeight: 104,
    backgroundColor: '#e6f5fa',
    borderColor: '#d7e7ec',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  tagChip: {
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#44c3f3',
  },
  tagChipActive: {
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#0d0d0d',
  },
  tagChipText: { fontSize: 12, color: '#0d0d0d', fontWeight: '800' },
  tagChipTextActive: { fontSize: 12, color: '#44c3f3', fontWeight: '800' },
  submitBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#44c3f3',
    borderTopWidth: 1,
    borderTopColor: '#0d0d0d',
  },
  submitButton: {
    height: 52,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0d0d0d',
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: { color: '#0d0d0d', fontSize: 16, fontWeight: '900' },
  edgeSwipeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 28,
    zIndex: 10,
  },
  errorText: {
    marginTop: 10,
    color: '#b14f4f',
    fontSize: 12,
  },
  fieldErrorText: {
    marginTop: 6,
    color: '#b14f4f',
    fontSize: 12,
    fontWeight: '700',
  },
  helperText: {
    color: '#626262',
    fontSize: 12,
  },
  emptyFolderWrap: {
    gap: 8,
  },
  createEmptyFolderButton: {
    alignSelf: 'flex-start',
    height: 36,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    backgroundColor: '#44c3f3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  createEmptyFolderButtonText: {
    color: '#0d0d0d',
    fontSize: 12,
    fontWeight: '900',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorTextInline: {
    color: '#b14f4f',
    fontSize: 12,
  },
  retryText: {
    color: '#087ca7',
    fontSize: 12,
    fontWeight: '700',
  },
  createFolderContainer: {
    marginTop: 8,
    gap: 8,
  },
  createFolderButton: {
    height: 40,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  createFolderButtonText: {
    color: '#44c3f3',
    fontSize: 12,
    fontWeight: '700',
  },
});

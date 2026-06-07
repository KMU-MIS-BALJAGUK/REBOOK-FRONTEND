import React, { useDeferredValue, useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
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

const INPUT_ACCESSORY_IDS = {
  book: 'quote-form-book-accessory',
  author: 'quote-form-author-accessory',
  page: 'quote-form-page-accessory',
  quote: 'quote-form-quote-accessory',
  memo: 'quote-form-memo-accessory',
  folder: 'quote-form-folder-accessory',
} as const;

const INPUT_ACCESSORIES = [
  { id: INPUT_ACCESSORY_IDS.book, label: '책 제목' },
  { id: INPUT_ACCESSORY_IDS.author, label: '저자' },
  { id: INPUT_ACCESSORY_IDS.page, label: '페이지' },
  { id: INPUT_ACCESSORY_IDS.quote, label: '추출된 문장' },
  { id: INPUT_ACCESSORY_IDS.memo, label: '내 코멘트' },
  { id: INPUT_ACCESSORY_IDS.folder, label: '새 폴더 이름' },
] as const;

type Props = {
  onBack: () => void;
  onSaved: () => void;
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
  const [book, setBook] = useState('');
  const [author, setAuthor] = useState('');
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
  const [activeInputLabel, setActiveInputLabel] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<AttachedOcrSource | null>(
    ocrSource ? { ...ocrSource, fullText: initialQuoteText ?? '' } : null,
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const methodLabel = initialMethod === 'manual' ? '직접입력' : initialMethod === 'camera' ? '사진찍기' : '갤러리';
  const apiError = createQuoteMutation.isError ? toUserMessage(createQuoteMutation.error) : null;
  const submitError = validationError ?? apiError;
  const isSubmitDisabled = createQuoteMutation.isPending || createFolderMutation.isPending;
  const deferredBook = useDeferredValue(book);
  const deferredAuthor = useDeferredValue(author);
  const bookSearchQuery = deferredBook.trim() || deferredAuthor.trim();
  const quoteBookSearchQuery = useQuoteBookSearch(bookSearchQuery, bookSearchQuery.length > 0);
  const createFolderError = createFolderMutation.isError ? toUserMessage(createFolderMutation.error) : null;
  const bookSearchError = quoteBookSearchQuery.isError ? toUserMessage(quoteBookSearchQuery.error) : null;
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

  const handleSubmit = () => {
    const trimmedBook = book.trim();
    const trimmedQuote = quote.trim();
    const pageNumber = Number(page.trim());

    if (!trimmedBook) {
      setValidationError('책 제목을 입력해주세요.');
      return;
    }

    if (!trimmedQuote) {
      setValidationError('문장을 입력해주세요.');
      return;
    }

    if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
      setValidationError('페이지는 1 이상의 숫자로 입력해주세요.');
      return;
    }

    setValidationError(null);
    createQuoteMutation.mutate(
      {
        bookTitle: trimmedBook,
        author: author.trim(),
        pageNumber,
        quoteText: trimmedQuote,
        memo: memo.trim() ? memo.trim() : undefined,
        folderId: selectedFolderId ?? undefined,
        registerType: initialMethod,
        ocrSource: quoteOcrSource,
      },
      {
        onSuccess: () => {
          onSaved();
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
      setActiveInputLabel(null);
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
    setActiveInputLabel(null);
  };

  const handleInputFocus = (label: string, scrollToBottom = false) => {
    setActiveInputLabel(label);
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
    <SafeAreaView style={styles.formSafeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#44c3f3" />
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>문장 저장하기</Text>
        <View style={styles.formHeaderRight} />
      </View>
      {activeInputLabel && Platform.OS !== 'ios' ? (
        <View style={styles.keyboardToolbar}>
          <Text style={styles.keyboardToolbarLabel}>{activeInputLabel} 입력 중</Text>
          <TouchableOpacity style={styles.keyboardDoneButton} onPress={finishInput}>
            <Text style={styles.keyboardDoneText}>완료</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
          style={styles.formInput}
          value={book}
          onChangeText={(value) => {
            setShowBookResults(true);
            setBook(value);
          }}
          placeholder="책 제목을 입력하세요"
          inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_IDS.book : undefined}
          onFocus={() => handleInputFocus('책 제목')}
          onBlur={() => setActiveInputLabel(null)}
        />
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
          style={styles.formInput}
          value={author}
          onChangeText={(value) => {
            setShowBookResults(true);
            setAuthor(value);
          }}
          placeholder="저자를 입력하세요"
          inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_IDS.author : undefined}
          onFocus={() => handleInputFocus('저자')}
          onBlur={() => setActiveInputLabel(null)}
        />
        <Text style={styles.formLabel}>페이지</Text>
        <TextInput
          style={styles.formInput}
          value={page}
          onChangeText={setPage}
          keyboardType="number-pad"
          placeholder="페이지 번호"
          inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_IDS.page : undefined}
          onFocus={() => handleInputFocus('페이지')}
          onBlur={() => setActiveInputLabel(null)}
        />
        <Text style={styles.formLabel}>추출된 문장</Text>
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
        <TextInput
          style={[styles.formTextArea, styles.quoteTextArea]}
          value={quote}
          onChangeText={setQuote}
          multiline
          placeholder="인상 깊은 문장을 입력하세요"
          inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_IDS.quote : undefined}
          onFocus={() => handleInputFocus('추출된 문장')}
          onBlur={() => setActiveInputLabel(null)}
        />
        <Text style={styles.formLabel}>내 코멘트 (선택)</Text>
        <TextInput
          style={[styles.formTextArea, styles.memoTextArea]}
          value={memo}
          onChangeText={setMemo}
          multiline
          placeholder="이 문장이 만든 생각을 자유롭게 적어보세요"
          inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_IDS.memo : undefined}
          onFocus={() => handleInputFocus('내 코멘트', true)}
          onBlur={() => setActiveInputLabel(null)}
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
            <Text style={styles.helperText}>등록된 폴더가 없어요.</Text>
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
              style={styles.formInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="새 폴더 이름 (최대 20자)"
              maxLength={20}
              inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_IDS.folder : undefined}
              onFocus={() => handleInputFocus('새 폴더 이름', true)}
              onBlur={() => setActiveInputLabel(null)}
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
        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
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
      {Platform.OS === 'ios' ? (
        <>
          {INPUT_ACCESSORIES.map((accessory) => (
            <InputAccessoryView key={accessory.id} nativeID={accessory.id}>
              <View style={styles.keyboardToolbar}>
                <Text style={styles.keyboardToolbarLabel}>{accessory.label} 입력 중</Text>
                <TouchableOpacity style={styles.keyboardDoneButton} onPress={finishInput}>
                  <Text style={styles.keyboardDoneText}>완료</Text>
                </TouchableOpacity>
              </View>
            </InputAccessoryView>
          ))}
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  keyboardToolbar: {
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#0d0d0d',
    backgroundColor: '#b8e8f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keyboardToolbarLabel: {
    color: '#0d0d0d',
    fontSize: 12,
    fontWeight: '700',
  },
  keyboardDoneButton: {
    minWidth: 58,
    height: 32,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardDoneText: {
    color: '#44c3f3',
    fontSize: 12,
    fontWeight: '900',
  },
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
    color: '#2f2a24',
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
  errorText: {
    marginTop: 10,
    color: '#b14f4f',
    fontSize: 12,
  },
  helperText: {
    color: '#626262',
    fontSize: 12,
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

import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RegisterType } from '../../../app/types';
import { toUserMessage } from '../../../shared/utils/apiError';
import { useCreateFolder } from '../hooks/useCreateFolder';
import { useQuoteBookSearch } from '../hooks/useQuoteBookSearch';
import { useCreateQuote } from '../hooks/useCreateQuote';
import { useFolders } from '../hooks/useFolders';

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
};

export function QuoteFormScreen({ onBack, onSaved, initialMethod, initialQuoteText, ocrSource }: Props) {
  const createQuoteMutation = useCreateQuote();
  const createFolderMutation = useCreateFolder();
  const foldersQuery = useFolders({ includeQuoteCount: true });
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const methodLabel = initialMethod === 'manual' ? '직접입력' : initialMethod === 'camera' ? '사진찍기' : '갤러리';
  const apiError = createQuoteMutation.isError ? toUserMessage(createQuoteMutation.error) : null;
  const submitError = validationError ?? apiError;
  const isSubmitDisabled = createQuoteMutation.isPending;
  const deferredBook = useDeferredValue(book);
  const deferredAuthor = useDeferredValue(author);
  const bookSearchQuery = deferredBook.trim() || deferredAuthor.trim();
  const quoteBookSearchQuery = useQuoteBookSearch(bookSearchQuery, bookSearchQuery.length > 0);
  const canUseOcrSource = useMemo(
    () => (initialMethod === 'camera' || initialMethod === 'gallery') && Boolean(ocrSource),
    [initialMethod, ocrSource],
  );
  const createFolderError = createFolderMutation.isError ? toUserMessage(createFolderMutation.error) : null;
  const bookSearchError = quoteBookSearchQuery.isError ? toUserMessage(quoteBookSearchQuery.error) : null;

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
        ocrSource: canUseOcrSource ? ocrSource : undefined,
      },
      {
        onSuccess: () => {
          onSaved();
        },
      },
    );
  };

  const handleCreateFolder = () => {
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
    createFolderMutation.mutate(
      { folderName: trimmedName },
      {
        onSuccess: async (createdFolder) => {
          await foldersQuery.refetch();
          setSelectedFolderId(createdFolder.folderId);
          setNewFolderName('');
          setIsCreatingFolder(false);
        },
      },
    );
  };

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
        <TextInput
          style={styles.formInput}
          value={book}
          onChangeText={(value) => {
            setShowBookResults(true);
            setBook(value);
          }}
          placeholder="책 제목을 입력하세요"
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
        />
        <Text style={styles.formLabel}>페이지</Text>
        <TextInput
          style={styles.formInput}
          value={page}
          onChangeText={setPage}
          keyboardType="number-pad"
          placeholder="페이지 번호"
        />
        <Text style={styles.formLabel}>수집 문장</Text>
        <TextInput
          style={styles.formTextArea}
          value={quote}
          onChangeText={setQuote}
          multiline
          placeholder="인상 깊은 문장을 입력하세요"
        />
        <Text style={styles.formLabel}>내 코멘트 (선택)</Text>
        <TextInput
          style={styles.formTextArea}
          value={memo}
          onChangeText={setMemo}
          multiline
          placeholder="이 문장이 만든 생각을 자유롭게 적어보세요"
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
            />
            <TouchableOpacity
              style={[styles.createFolderButton, createFolderMutation.isPending && styles.submitButtonDisabled]}
              disabled={createFolderMutation.isPending}
              onPress={handleCreateFolder}
            >
              {createFolderMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
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
      <TouchableOpacity style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]} disabled={isSubmitDisabled} onPress={handleSubmit}>
        {createQuoteMutation.isPending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>문장 저장하기</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  formSafeArea: { flex: 1, backgroundColor: '#f6f3ee' },
  formHeader: {
    height: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: { fontSize: 18, color: '#453d33' },
  formHeaderTitle: { fontSize: 14, color: '#3a3228', fontWeight: '600' },
  formHeaderRight: { width: 18 },
  formBody: { paddingHorizontal: 14, paddingBottom: 16 },
  formLabel: { marginTop: 10, marginBottom: 6, fontSize: 11, color: '#746b5f', fontWeight: '600' },
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
  searchResultsWrap: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e4dbcd',
    backgroundColor: '#f9f6f0',
    padding: 8,
  },
  searchResultsList: {
    maxHeight: 180,
  },
  searchResultItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebe2d6',
    backgroundColor: '#fbf8f2',
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
    color: '#8a7f71',
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
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
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
  tagChipText: { fontSize: 10, color: '#7f766a' },
  tagChipTextActive: { fontSize: 10, color: '#fff', fontWeight: '600' },
  submitButton: {
    height: 44,
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 9,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  errorText: {
    marginTop: 10,
    color: '#b14f4f',
    fontSize: 12,
  },
  helperText: {
    color: '#7f766a',
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
    color: '#8d7353',
    fontSize: 12,
    fontWeight: '700',
  },
  createFolderContainer: {
    marginTop: 8,
    gap: 8,
  },
  createFolderButton: {
    height: 38,
    borderRadius: 8,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  createFolderButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

import React, { useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RegisterType } from '../../../app/types';
import { toUserMessage } from '../../../shared/utils/apiError';
import { useCreateQuote } from '../hooks/useCreateQuote';

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
  const [book, setBook] = useState('');
  const [author, setAuthor] = useState('');
  const [page, setPage] = useState('');
  const [quote, setQuote] = useState(initialQuoteText ?? '');
  const [memo, setMemo] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const methodLabel = initialMethod === 'manual' ? '직접입력' : initialMethod === 'camera' ? '사진찍기' : '갤러리';
  const apiError = createQuoteMutation.isError ? toUserMessage(createQuoteMutation.error) : null;
  const submitError = validationError ?? apiError;
  const isSubmitDisabled = createQuoteMutation.isPending;
  const canUseOcrSource = useMemo(
    () => (initialMethod === 'camera' || initialMethod === 'gallery') && Boolean(ocrSource),
    [initialMethod, ocrSource],
  );

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

    if (!Number.isFinite(pageNumber) || pageNumber <= 0) {
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
        <TextInput style={styles.formInput} value={book} onChangeText={setBook} placeholder="책 제목을 입력하세요" />
        <Text style={styles.formLabel}>저자</Text>
        <TextInput style={styles.formInput} value={author} onChangeText={setAuthor} placeholder="저자를 입력하세요" />
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
});

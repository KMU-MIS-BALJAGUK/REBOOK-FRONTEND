import React, { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CommunityDiscussionCommentItem,
  CommunityDiscussionDetailResult,
} from '../model/communityBook.types';

type Props = {
  detail: CommunityDiscussionDetailResult | undefined;
  coverImageUrl: string;
  comments: CommunityDiscussionCommentItem[];
  isDetailLoading: boolean;
  detailErrorMessage: string | null;
  isCommentsLoading: boolean;
  commentsErrorMessage: string | null;
  likeErrorMessage: string | null;
  commentErrorMessage: string | null;
  commentContent: string;
  isLikePending: boolean;
  isCommentPending: boolean;
  onChangeComment: (value: string) => void;
  onClose: () => void;
  onRetryDetail: () => void;
  onRetryComments: () => void;
  onToggleLike: () => void;
  onSubmitComment: () => void;
};

export function DiscussionDetailSheet({
  detail,
  coverImageUrl,
  comments,
  isDetailLoading,
  detailErrorMessage,
  isCommentsLoading,
  commentsErrorMessage,
  likeErrorMessage,
  commentErrorMessage,
  commentContent,
  isLikePending,
  isCommentPending,
  onChangeComment,
  onClose,
  onRetryDetail,
  onRetryComments,
  onToggleLike,
  onSubmitComment,
}: Props) {
  const [isCommentInputFocused, setIsCommentInputFocused] = useState(false);
  const [isShowingAllComments, setIsShowingAllComments] = useState(false);
  const visibleComments = isShowingAllComments ? comments : comments.slice(0, 5);
  const hasHiddenComments = comments.length > 5;

  useEffect(() => {
    setIsShowingAllComments(false);
  }, [detail?.discussionId, comments.length]);

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>토론 상세</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, isCommentInputFocused && styles.contentWithKeyboardAction]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          {isDetailLoading ? <Text style={styles.infoText}>토론 상세를 불러오는 중...</Text> : null}
          {!isDetailLoading && detailErrorMessage ? (
            <StateMessage message={detailErrorMessage} onRetry={onRetryDetail} />
          ) : null}

          {!isDetailLoading && !detailErrorMessage && detail ? (
            <>
              <View style={styles.bookCard}>
                {coverImageUrl ? (
                  <Image source={{ uri: coverImageUrl }} style={styles.cover} resizeMode="cover" />
                ) : (
                  <View style={styles.coverFallback}>
                    <Text style={styles.coverFallbackText}>표지</Text>
                  </View>
                )}
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle} numberOfLines={2}>{detail.bookTitle}</Text>
                  <Text style={styles.bookAuthor}>{detail.bookAuthor}</Text>
                </View>
              </View>

              <View style={styles.discussionCard}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{detail.categoryLabel}</Text>
                </View>
                <Text style={styles.title}>{detail.title}</Text>
                <Text style={styles.writer}>
                  {detail.writer.nickname} · {formatDate(detail.createdAt)}
                </Text>
                <Text style={styles.body}>{detail.content}</Text>
                <View style={styles.reactionRow}>
                  <Text style={styles.countText}>댓글 {detail.commentCount}</Text>
                  <TouchableOpacity
                    style={[styles.likeButton, detail.myLike && styles.likeButtonActive]}
                    onPress={onToggleLike}
                    disabled={isLikePending}
                  >
                    <Text style={[styles.likeButtonText, detail.myLike && styles.likeButtonTextActive]}>
                      {detail.myLike ? '♥' : '♡'} {detail.likeCount}
                    </Text>
                  </TouchableOpacity>
                </View>
                {likeErrorMessage ? <Text style={styles.errorText}>{likeErrorMessage}</Text> : null}
              </View>

              <View style={styles.commentsCard}>
                <View style={styles.commentsHeader}>
                  <Text style={styles.commentsTitle}>댓글 {detail.commentCount}</Text>
                  <View style={styles.commentsSortBadge}>
                    <Text style={styles.commentsSortBadgeText}>최신순</Text>
                  </View>
                </View>
                {isCommentsLoading ? <Text style={styles.infoText}>댓글을 불러오는 중...</Text> : null}
                {!isCommentsLoading && commentsErrorMessage ? (
                  <StateMessage message={commentsErrorMessage} onRetry={onRetryComments} />
                ) : null}
                {!isCommentsLoading && !commentsErrorMessage && comments.length === 0 ? (
                  <Text style={styles.infoText}>첫 댓글을 남겨보세요.</Text>
                ) : null}
                {!isCommentsLoading && !commentsErrorMessage
                  ? visibleComments.map((comment) => (
                      <View key={comment.commentId} style={styles.commentItem}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentWriter}>{comment.writer.nickname}</Text>
                          <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                        </View>
                        <Text style={styles.commentBody}>{comment.content}</Text>
                      </View>
                    ))
                  : null}
                {!isCommentsLoading && !commentsErrorMessage && hasHiddenComments ? (
                  <TouchableOpacity
                    style={styles.moreCommentsButton}
                    onPress={() => setIsShowingAllComments((prev) => !prev)}
                  >
                    <Text style={styles.moreCommentsButtonText}>
                      {isShowingAllComments ? '댓글 접기' : `댓글 더보기 (${comments.length - 5}개)`}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TextInput
                  style={styles.commentInput}
                  placeholder="댓글을 입력하세요"
                  placeholderTextColor="#8c8378"
                  value={commentContent}
                  onChangeText={onChangeComment}
                  onFocus={() => setIsCommentInputFocused(true)}
                  onBlur={() => setIsCommentInputFocused(false)}
                  multiline
                  maxLength={1000}
                />
                {commentErrorMessage ? <Text style={styles.errorText}>{commentErrorMessage}</Text> : null}
              </View>
            </>
          ) : null}
        </ScrollView>

        {isCommentInputFocused ? (
          <View style={styles.keyboardActionBar}>
            <TouchableOpacity
              style={[styles.keyboardSubmitButton, isCommentPending && styles.buttonDisabled]}
              onPress={() => {
                Keyboard.dismiss();
                onSubmitComment();
              }}
              disabled={isCommentPending}
            >
              <Text style={styles.keyboardSubmitButtonText}>
                {isCommentPending ? '작성 중...' : '댓글 작성'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

function StateMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.stateWrap}>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 17, 17, 0.52)',
  },
  sheet: {
    width: '100%',
    height: '92%',
    backgroundColor: '#f9f6f0',
    borderTopWidth: 2,
    borderColor: '#111',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#111',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#111',
  },
  headerTitle: { color: '#111', fontSize: 20, fontWeight: '800' },
  closeButton: {
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  closeButtonText: { color: '#111', fontSize: 12, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  contentWithKeyboardAction: { paddingBottom: 88 },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    padding: 12,
    marginBottom: 12,
  },
  cover: { width: 58, height: 76, borderWidth: 1, borderColor: '#111', backgroundColor: '#fff' },
  coverFallback: {
    width: 58,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#eee8de',
  },
  coverFallbackText: { color: '#111', fontSize: 11, fontWeight: '700' },
  bookInfo: { flex: 1, marginLeft: 12 },
  bookTitle: { color: '#111', fontSize: 16, fontWeight: '800', marginBottom: 5 },
  bookAuthor: { color: '#222', fontSize: 12, fontWeight: '600' },
  discussionCard: {
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: { color: '#111', fontSize: 11, fontWeight: '800' },
  title: { color: '#111', fontSize: 18, lineHeight: 25, fontWeight: '800', marginBottom: 7 },
  writer: { color: '#6a6258', fontSize: 11, marginBottom: 16 },
  body: { color: '#25211d', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  reactionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countText: { color: '#5c554d', fontSize: 12, fontWeight: '600' },
  likeButton: {
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  likeButtonActive: { backgroundColor: '#111' },
  likeButtonText: { color: '#111', fontSize: 13, fontWeight: '800' },
  likeButtonTextActive: { color: '#44c3f3' },
  commentsCard: {
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 12,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  commentsTitle: { color: '#111', fontSize: 15, fontWeight: '800' },
  commentsSortBadge: {
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#f9f6f0',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  commentsSortBadgeText: { color: '#111', fontSize: 11, fontWeight: '700' },
  commentItem: {
    borderTopWidth: 1,
    borderColor: '#d8d2c8',
    paddingVertical: 11,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  commentWriter: { color: '#111', fontSize: 12, fontWeight: '800' },
  commentDate: { color: '#82796e', fontSize: 10 },
  commentBody: { color: '#302b26', fontSize: 13, lineHeight: 19 },
  moreCommentsButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 6,
    marginBottom: 6,
  },
  moreCommentsButtonText: { color: '#111', fontSize: 12, fontWeight: '800' },
  commentInput: {
    minHeight: 82,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#f9f6f0',
    color: '#111',
    textAlignVertical: 'top',
    paddingHorizontal: 10,
    paddingTop: 10,
    marginTop: 14,
    marginBottom: 8,
  },
  keyboardActionBar: {
    borderTopWidth: 1,
    borderColor: '#111',
    backgroundColor: '#f9f6f0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
  },
  keyboardSubmitButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  keyboardSubmitButtonText: { color: '#44c3f3', fontSize: 12, fontWeight: '800' },
  buttonDisabled: { opacity: 0.55 },
  stateWrap: { alignItems: 'center', paddingVertical: 18 },
  infoText: { color: '#675f55', fontSize: 12, textAlign: 'center', paddingVertical: 14 },
  errorText: { color: '#b42318', fontSize: 12, lineHeight: 18, marginTop: 6 },
  retryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  retryButtonText: { color: '#111', fontSize: 12, fontWeight: '800' },
});

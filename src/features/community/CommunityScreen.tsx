import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
import { useMyCommunityBooks } from './hooks/useMyCommunityBooks';
import { usePopularCommunityBooks } from './hooks/usePopularCommunityBooks';
import { useCommunityBookDetail } from './hooks/useCommunityBookDetail';
import { useCommunityBookTopQuotes } from './hooks/useCommunityBookTopQuotes';
import { useBookDiscussions } from './hooks/useBookDiscussions';
import { useCreateBookDiscussion } from './hooks/useCreateBookDiscussion';
import { CommunityDiscussionCategory } from './model/communityBook.types';
import { useDiscussionDetail } from './hooks/useDiscussionDetail';
import { useToggleDiscussionLike } from './hooks/useToggleDiscussionLike';
import { useDiscussionComments } from './hooks/useDiscussionComments';
import { useCreateDiscussionComment } from './hooks/useCreateDiscussionComment';
import { toUserMessage } from '../../shared/utils/apiError';
import { useCommunityBookPolls } from './hooks/useCommunityBookPolls';
import { useCreateCommunityBookPoll } from './hooks/useCreateCommunityBookPoll';
import { useVoteCommunityBookPoll } from './hooks/useVoteCommunityBookPoll';
import { useSearchCommunityBooks } from './hooks/useSearchCommunityBooks';
import { API_BASE_URL } from '../../shared/constants/api';
import { BottomNav } from '../../shared/ui/BottomNav';
import { FeedTopBar } from '../../shared/ui/FeedTopBar';
import { DiscussionDetailSheet } from './components/DiscussionDetailSheet';
import { CommunityAiTopicsPanel } from './components/CommunityAiTopicsPanel';
import { CommunityAiTopicSet } from './model/communityAiTopic.types';
import { useGenerateCommunityAiTopics } from './hooks/useGenerateCommunityAiTopics';
import { useCommunityAiTopics } from './hooks/useCommunityAiTopics';

type Props = {
  nickname: string;
  onPressHome: () => void;
  onPressAiChat: () => void;
  onPressMyPage: () => void;
  showBottomNav?: boolean;
};

export function CommunityScreen({ nickname, onPressHome, onPressAiChat, onPressMyPage, showBottomNav = true }: Props) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<'TOP_QUOTES' | 'DISCUSSION' | 'VOTE' | 'AI_TOPICS'>('TOP_QUOTES');
  const [communityTopicSet, setCommunityTopicSet] = useState<CommunityAiTopicSet | null>(null);
  const [communityTopicError, setCommunityTopicError] = useState<string | null>(null);
  const [isCreateDiscussionVisible, setIsCreateDiscussionVisible] = useState(false);
  const [newDiscussionCategory, setNewDiscussionCategory] = useState<CommunityDiscussionCategory>('QUESTION');
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [createDiscussionError, setCreateDiscussionError] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [createCommentError, setCreateCommentError] = useState<string | null>(null);
  const [isCreatePollVisible, setIsCreatePollVisible] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptionA, setNewPollOptionA] = useState('');
  const [newPollOptionB, setNewPollOptionB] = useState('');
  const [createPollError, setCreatePollError] = useState<string | null>(null);
  const [votePollError, setVotePollError] = useState<{ pollId: number; message: string } | null>(null);
  const displayName = nickname.trim() ? nickname : 'User';
  const trimmedKeyword = searchKeyword.trim();
  const myBooksQuery = useMyCommunityBooks(
    useMemo(
      () => ({
        size: 10,
      }),
      [],
    ),
  );
  const myBookItems = myBooksQuery.data?.items ?? [];
  const myBookCount = myBooksQuery.data?.totalCount ?? 0;
  const popularBooksQuery = usePopularCommunityBooks(
    useMemo(
      () => ({
        size: 10,
        period: 'WEEK' as const,
        sort: 'HOT' as const,
      }),
      [],
    ),
  );
  const popularBookItems = popularBooksQuery.data?.items ?? [];
  const bookDetailQuery = useCommunityBookDetail(selectedBookId);
  const topQuotesQuery = useCommunityBookTopQuotes(
    selectedBookId,
    useMemo(
      () => ({
        size: 3,
        period: 'ALL' as const,
        sort: 'SAVED_DESC' as const,
      }),
      [],
    ),
  );
  const discussionsQuery = useBookDiscussions(
    selectedBookId,
    useMemo(
      () => ({
        sort: 'LATEST' as const,
        size: 10,
      }),
      [],
    ),
  );
  const createDiscussionMutation = useCreateBookDiscussion(selectedBookId);
  const discussionDetailQuery = useDiscussionDetail(selectedDiscussionId);
  const toggleDiscussionLikeMutation = useToggleDiscussionLike();
  const discussionCommentsQuery = useDiscussionComments(
    selectedDiscussionId,
    useMemo(
      () => ({
        size: 20,
        sort: 'LATEST' as const,
      }),
      [],
    ),
  );
  const createCommentMutation = useCreateDiscussionComment(selectedDiscussionId);
  const pollsQuery = useCommunityBookPolls(
    selectedBookId,
    useMemo(
      () => ({
        size: 10,
        sort: 'LATEST' as const,
        onlyActive: false,
      }),
      [],
    ),
  );
  const createPollMutation = useCreateCommunityBookPoll(selectedBookId);
  const votePollMutation = useVoteCommunityBookPoll(selectedBookId);
  const generateCommunityAiTopicsMutation = useGenerateCommunityAiTopics();
  const communityAiTopicsQuery = useCommunityAiTopics({
    bookId: selectedBookId,
    enabled: selectedBookId !== null,
  });
  const searchBooksQuery = useSearchCommunityBooks(
    useMemo(
      () => ({
        q: trimmedKeyword,
        size: 10,
        sort: 'RELEVANCE' as const,
      }),
      [trimmedKeyword],
    ),
    trimmedKeyword.length > 0,
  );
  const searchBookItems = searchBooksQuery.data?.items ?? [];

  useEffect(() => {
    setCommunityTopicError(null);
    generateCommunityAiTopicsMutation.reset();
  }, [selectedBookId]);

  useEffect(() => {
    if (!communityAiTopicsQuery.data) {
      setCommunityTopicSet(null);
      return;
    }

    setCommunityTopicSet(communityAiTopicsQuery.data);
  }, [communityAiTopicsQuery.data]);

  const closeDiscussionComposer = () => {
    Keyboard.dismiss();
    setCreateDiscussionError(null);
    setIsCreateDiscussionVisible(false);
  };

  const closePollComposer = () => {
    Keyboard.dismiss();
    setCreatePollError(null);
    setIsCreatePollVisible(false);
  };

  const handleCloseBookDetail = () => {
    if (selectedDiscussionId !== null) {
      Keyboard.dismiss();
      setCreateCommentError(null);
      setNewCommentContent('');
      setSelectedDiscussionId(null);
      return;
    }
    if (isCreateDiscussionVisible) {
      closeDiscussionComposer();
      return;
    }
    if (isCreatePollVisible) {
      closePollComposer();
      return;
    }

    setSelectedBookId(null);
    setCommunityTopicSet(null);
    setCommunityTopicError(null);
    generateCommunityAiTopicsMutation.reset();
  };

  const handleGenerateCommunityTopics = () => {
    if (!selectedBookId) {
      return;
    }

    setCommunityTopicError(null);
    generateCommunityAiTopicsMutation.mutate(
      { bookId: selectedBookId },
      {
        onSuccess: async () => {
          await communityAiTopicsQuery.refetch();
        },
        onError: (error) => {
          setCommunityTopicSet(null);
          setCommunityTopicError(toUserMessage(error));
        },
      },
    );
  };

  const handleCreateDiscussion = () => {
    if (createDiscussionMutation.isPending) {
      return;
    }

    const title = newDiscussionTitle.trim();
    const content = newDiscussionContent.trim();

    if (!title) {
      setCreateDiscussionError('제목을 입력해주세요.');
      return;
    }
    if (!content) {
      setCreateDiscussionError('내용을 입력해주세요.');
      return;
    }

    setCreateDiscussionError(null);
    createDiscussionMutation.mutate(
      {
        category: newDiscussionCategory,
        title,
        content,
      },
      {
        onSuccess: async () => {
          closeDiscussionComposer();
          setNewDiscussionTitle('');
          setNewDiscussionContent('');
          setNewDiscussionCategory('QUESTION');
          await discussionsQuery.refetch();
        },
      },
    );
  };

  const handleCreateComment = () => {
    if (createCommentMutation.isPending) {
      return;
    }

    const content = newCommentContent.trim();
    if (!content) {
      setCreateCommentError('댓글 내용을 입력해주세요.');
      return;
    }

    setCreateCommentError(null);
    createCommentMutation.mutate(
      { content },
      {
        onSuccess: async () => {
          Keyboard.dismiss();
          setNewCommentContent('');
          await discussionCommentsQuery.refetch();
          await discussionDetailQuery.refetch();
          await discussionsQuery.refetch();
        },
      },
    );
  };

  const handleCreatePoll = () => {
    if (createPollMutation.isPending) {
      return;
    }

    const question = newPollQuestion.trim();
    const optionA = newPollOptionA.trim();
    const optionB = newPollOptionB.trim();

    if (!question) {
      setCreatePollError('질문을 입력해주세요.');
      return;
    }
    if (!optionA || !optionB) {
      setCreatePollError('선택지 2개를 모두 입력해주세요.');
      return;
    }

    setCreatePollError(null);
    createPollMutation.mutate(
      {
        question,
        optionA,
        optionB,
      },
      {
        onSuccess: async () => {
          closePollComposer();
          setNewPollQuestion('');
          setNewPollOptionA('');
          setNewPollOptionB('');
          await pollsQuery.refetch();
        },
      },
    );
  };

  const handleVotePoll = async (pollId: number, currentOptionId: number | null, nextOptionId: number) => {
    if (votePollMutation.isPending) {
      return;
    }

    const vote = (optionId: number) =>
      votePollMutation.mutateAsync({
        pollId,
        optionId,
      });
    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    setVotePollError(null);

    try {
      if (currentOptionId !== null && currentOptionId !== nextOptionId) {
        await vote(currentOptionId);
        await pollsQuery.refetch();
        await wait(120);
      }

      await vote(nextOptionId);
    } catch (error) {
      const message = toUserMessage(error);
      if (!message.includes('이미 참여한 투표')) {
        setVotePollError({ pollId, message });
        return;
      }

      const refreshedPolls = await pollsQuery.refetch();
      const latestPoll = refreshedPolls.data?.items.find((item) => item.pollId === pollId) ?? null;
      const latestOptionId = latestPoll?.myVoteOptionId ?? null;

      if (latestOptionId === null || latestOptionId === nextOptionId) {
        setVotePollError({ pollId, message });
        return;
      }

      try {
        await vote(latestOptionId);
        await pollsQuery.refetch();
        await wait(120);
        await vote(nextOptionId);
      } catch (retryError) {
        setVotePollError({ pollId, message: toUserMessage(retryError) });
      }
    } finally {
      await pollsQuery.refetch();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <FeedTopBar searchKeyword={searchKeyword} onSearchKeywordChange={setSearchKeyword} onPressMyPage={onPressMyPage} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {trimmedKeyword ? (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleLarge}>검색된 책 커뮤니티</Text>
              </View>
              {searchBooksQuery.isLoading ? <Text style={styles.infoText}>검색 결과를 불러오는 중...</Text> : null}
              {!searchBooksQuery.isLoading && searchBooksQuery.isError ? (
                <View style={styles.stateWrap}>
                  <Text style={styles.errorText}>{toUserMessage(searchBooksQuery.error)}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => void searchBooksQuery.refetch()}>
                    <Text style={styles.retryButtonText}>다시 시도</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {!searchBooksQuery.isLoading && !searchBooksQuery.isError && searchBookItems.length === 0 ? (
                <Text style={styles.infoText}>검색 결과가 없어요.</Text>
              ) : null}
              {!searchBooksQuery.isLoading && !searchBooksQuery.isError
                ? searchBookItems.map((book) => (
                    <TouchableOpacity
                      key={`search-${book.bookId}`}
                      style={styles.bookCard}
                      onPress={() => {
                        setDetailTab('TOP_QUOTES');
                        setSelectedBookId(book.bookId);
                      }}
                    >
                      <View style={styles.bookRow}>
                        <BookCover url={book.coverImageUrl} size="medium" />
                        <View style={styles.bookContent}>
                          <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                          <Text style={styles.bookAuthor}>{book.author}</Text>
                          <Text style={styles.bookMeta}>읽는 중 {book.readerCount}명 · 저장 문장 {book.quoteCount}</Text>
                        </View>
                      </View>
                      <View style={styles.previewBox}>
                        <Text style={styles.previewLabel}>↗ 저장된 문장</Text>
                        <Text style={styles.previewText} numberOfLines={1}>
                          총 {book.quoteCount}개의 문장이 저장되었어요.
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                : null}
            </>
          ) : null}

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleLarge}>내가 읽고 있는 책</Text>
            <Text style={styles.sectionCountText}>{myBookCount}권</Text>
          </View>

          {myBooksQuery.isLoading ? (
            <Text style={styles.infoText}>책 목록을 불러오는 중...</Text>
          ) : null}

          {!myBooksQuery.isLoading && myBooksQuery.isError ? (
            <View style={styles.stateWrap}>
              <Text style={styles.errorText}>{toUserMessage(myBooksQuery.error)}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void myBooksQuery.refetch()}>
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!myBooksQuery.isLoading && !myBooksQuery.isError && myBookItems.length === 0 ? (
            <Text style={styles.infoText}>읽고 있는 책이 없어요.</Text>
          ) : null}

          {!myBooksQuery.isLoading && !myBooksQuery.isError
            ? myBookItems.map((book) => (
                <TouchableOpacity
                  key={book.bookId}
                  style={styles.bookCard}
                  onPress={() => {
                    setDetailTab('TOP_QUOTES');
                    setSelectedBookId(book.bookId);
                  }}
                >
                  <View style={styles.bookRow}>
                    <BookCover url={book.coverImageUrl} size="medium" />
                    <View style={styles.bookContent}>
                      <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                      <Text style={styles.bookAuthor}>{book.author}</Text>
                      <Text style={styles.bookMeta}>읽는 중 {book.readerCount}명 · 새 글 {book.recentPostCount}</Text>
                    </View>
                  </View>
                  <View style={styles.previewBox}>
                    <Text style={styles.previewLabel}>↗ 많이 저장한 문장</Text>
                    <Text style={styles.previewText} numberOfLines={1}>
                      {book.savedQuotePreview ?? '아직 저장한 문장이 없어요.'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            : null}

          <Text style={styles.sectionTitleLarge}>인기 책 커뮤니티</Text>
          {popularBooksQuery.isLoading ? <Text style={styles.infoText}>인기 책을 불러오는 중...</Text> : null}
          {!popularBooksQuery.isLoading && popularBooksQuery.isError ? (
            <View style={styles.stateWrap}>
              <Text style={styles.errorText}>{toUserMessage(popularBooksQuery.error)}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void popularBooksQuery.refetch()}>
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {!popularBooksQuery.isLoading && !popularBooksQuery.isError && popularBookItems.length === 0 ? (
            <Text style={styles.infoText}>인기 책이 아직 없어요.</Text>
          ) : null}
          {!popularBooksQuery.isLoading && !popularBooksQuery.isError
            ? popularBookItems.map((book) => (
                <TouchableOpacity
                  key={`popular-${book.bookId}`}
                  style={styles.smallCard}
                  onPress={() => {
                    setDetailTab('TOP_QUOTES');
                    setSelectedBookId(book.bookId);
                  }}
                >
                  <View style={styles.popularBookRow}>
                      <BookCover url={book.coverImageUrl} size="small" />
                    <View style={styles.bookContent}>
                      <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                      <Text style={styles.bookAuthor}>{book.author}</Text>
                      <Text style={styles.bookMeta}>읽는 중 {book.readerCount}명 · 새 글 {book.recentPostCount}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            : null}
        </ScrollView>

        <Modal visible={selectedBookId !== null} transparent animationType="fade" onRequestClose={handleCloseBookDetail}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, styles.bookDetailModalCard]}>
              <Text style={styles.modalTitle}>책별 커뮤니티</Text>
              {bookDetailQuery.isLoading ? <Text style={styles.infoText}>책 정보를 불러오는 중...</Text> : null}
              {!bookDetailQuery.isLoading && bookDetailQuery.isError ? (
                <View style={styles.stateWrap}>
                  <Text style={styles.errorText}>{toUserMessage(bookDetailQuery.error)}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => void bookDetailQuery.refetch()}>
                    <Text style={styles.retryButtonText}>다시 시도</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {!bookDetailQuery.isLoading && !bookDetailQuery.isError && bookDetailQuery.data ? (
                <ScrollView
                  style={styles.bookDetailScroll}
                  contentContainerStyle={styles.bookDetailScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.detailHeaderCard}>
                    <View style={styles.bookRow}>
                      <BookCover url={bookDetailQuery.data.coverImageUrl} size="large" />
                      <View style={styles.bookContent}>
                        <Text style={styles.bookTitle} numberOfLines={1}>{bookDetailQuery.data.title}</Text>
                        <Text style={styles.bookAuthor}>{bookDetailQuery.data.author}</Text>
                        <Text style={styles.bookMeta}>지금 {bookDetailQuery.data.readerCount}명이 읽고 있어요</Text>
                      </View>
                    </View>
                    <Text style={styles.detailHelperText}>같은 책을 읽은 사람들은 어떤 문장을 남겼을까요?</Text>
                  </View>
                  <View style={styles.detailTabRow}>
                    <TouchableOpacity
                      style={[styles.detailTabButton, detailTab === 'TOP_QUOTES' && styles.detailTabButtonActive]}
                      onPress={() => setDetailTab('TOP_QUOTES')}
                    >
                      <Text style={[styles.detailTabButtonText, detailTab === 'TOP_QUOTES' && styles.detailTabButtonTextActive]}>
                        많이 저장한 문장
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.detailTabButton, detailTab === 'DISCUSSION' && styles.detailTabButtonActive]}
                      onPress={() => setDetailTab('DISCUSSION')}
                    >
                      <Text style={[styles.detailTabButtonText, detailTab === 'DISCUSSION' && styles.detailTabButtonTextActive]}>
                        토론
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.detailTabButton, detailTab === 'VOTE' && styles.detailTabButtonActive]}
                      onPress={() => setDetailTab('VOTE')}
                    >
                      <Text style={[styles.detailTabButtonText, detailTab === 'VOTE' && styles.detailTabButtonTextActive]}>
                        투표
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.detailTabButton, detailTab === 'AI_TOPICS' && styles.detailTabButtonActive]}
                      onPress={() => setDetailTab('AI_TOPICS')}
                    >
                      <Text style={[styles.detailTabButtonText, detailTab === 'AI_TOPICS' && styles.detailTabButtonTextActive]}>
                        AI 주제
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {detailTab === 'TOP_QUOTES' ? (
                    <>
                      {topQuotesQuery.isLoading ? <Text style={styles.infoText}>많이 저장한 문장을 불러오는 중...</Text> : null}
                      {!topQuotesQuery.isLoading && topQuotesQuery.isError ? (
                        <View style={styles.stateWrap}>
                          <Text style={styles.errorText}>{toUserMessage(topQuotesQuery.error)}</Text>
                          <TouchableOpacity style={styles.retryButton} onPress={() => void topQuotesQuery.refetch()}>
                            <Text style={styles.retryButtonText}>다시 시도</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                      {!topQuotesQuery.isLoading && !topQuotesQuery.isError && (topQuotesQuery.data?.items ?? []).length === 0 ? (
                        <Text style={styles.infoText}>많이 저장한 문장이 아직 없어요.</Text>
                      ) : null}
                      {!topQuotesQuery.isLoading && !topQuotesQuery.isError
                        ? (topQuotesQuery.data?.items ?? []).map((item) => (
                            <View key={item.quoteId} style={styles.quoteRankCard}>
                              <View style={styles.rankBadge}>
                                <Text style={styles.rankBadgeText}>{item.rank}</Text>
                              </View>
                              <View style={styles.rankContent}>
                                <Text style={styles.rankQuoteText} numberOfLines={1}>{item.quoteText}</Text>
                                <Text style={styles.rankMetaText}>저장 {item.savedCount}회</Text>
                              </View>
                            </View>
                          ))
                        : null}
                    </>
                  ) : detailTab === 'DISCUSSION' ? (
                    <>
                      {discussionsQuery.isLoading ? <Text style={styles.infoText}>토론 목록을 불러오는 중...</Text> : null}
                      {!discussionsQuery.isLoading && discussionsQuery.isError ? (
                        <View style={styles.stateWrap}>
                          <Text style={styles.errorText}>{toUserMessage(discussionsQuery.error)}</Text>
                          <TouchableOpacity style={styles.retryButton} onPress={() => void discussionsQuery.refetch()}>
                            <Text style={styles.retryButtonText}>다시 시도</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                      {!discussionsQuery.isLoading && !discussionsQuery.isError && (discussionsQuery.data?.items ?? []).length === 0 ? (
                        <Text style={styles.infoText}>등록된 토론이 아직 없어요.</Text>
                      ) : null}
                      {!discussionsQuery.isLoading && !discussionsQuery.isError
                        ? (discussionsQuery.data?.items ?? []).map((item) => (
                            <TouchableOpacity
                              key={item.discussionId}
                              style={styles.discussionCard}
                              onPress={() => setSelectedDiscussionId(item.discussionId)}
                            >
                              <View style={styles.discussionBadge}>
                                <Text style={styles.discussionBadgeText}>{item.categoryLabel}</Text>
                              </View>
                              <Text style={styles.discussionTitle}>{item.title}</Text>
                              <Text style={styles.discussionPreview}>{item.preview}</Text>
                              <View style={styles.discussionActionRow}>
                                <Text style={styles.discussionMeta}>댓글 {item.commentCount}</Text>
                                <TouchableOpacity
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    toggleDiscussionLikeMutation.mutate(item.discussionId, {
                                      onSuccess: async () => {
                                        await discussionsQuery.refetch();
                                        if (selectedDiscussionId === item.discussionId) {
                                          await discussionDetailQuery.refetch();
                                        }
                                      },
                                    });
                                  }}
                                >
                                  <Text style={styles.likeInlineText}>
                                    {item.myLike ? '♥' : '♡'} {item.likeCount}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </TouchableOpacity>
                          ))
                        : null}
                    </>
                  ) : detailTab === 'VOTE' ? (
                    <>
                      {pollsQuery.isLoading ? <Text style={styles.infoText}>투표 목록을 불러오는 중...</Text> : null}
                      {!pollsQuery.isLoading && pollsQuery.isError ? (
                        <View style={styles.stateWrap}>
                          <Text style={styles.errorText}>{toUserMessage(pollsQuery.error)}</Text>
                          <TouchableOpacity style={styles.retryButton} onPress={() => void pollsQuery.refetch()}>
                            <Text style={styles.retryButtonText}>다시 시도</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                      {!pollsQuery.isLoading && !pollsQuery.isError && (pollsQuery.data?.items ?? []).length === 0 ? (
                        <Text style={styles.infoText}>등록된 투표가 아직 없어요.</Text>
                      ) : null}
                      {!pollsQuery.isLoading && !pollsQuery.isError
                        ? (pollsQuery.data?.items ?? []).map((poll) => (
                          <View key={poll.pollId} style={styles.pollCard}>
                              <Text style={styles.pollQuestion}>{poll.question}</Text>
                              <View style={styles.pollOptionsWrap}>
                                <View style={styles.pollOptionsRow}>
                                  <TouchableOpacity
                                    style={[
                                      styles.pollOptionBox,
                                      poll.myVoteOptionId === poll.optionA.optionId && styles.pollOptionBoxSelected,
                                    ]}
                                    onPress={() => {
                                      void handleVotePoll(poll.pollId, poll.myVoteOptionId, poll.optionA.optionId);
                                    }}
                                    disabled={votePollMutation.isPending}
                                  >
                                    <Text
                                      style={[
                                        styles.pollOptionPercentage,
                                        poll.myVoteOptionId === poll.optionA.optionId && styles.pollOptionPercentageSelected,
                                      ]}
                                    >
                                      {poll.optionA.percentage}%
                                    </Text>
                                    <Text
                                      style={[
                                        styles.pollOptionLabel,
                                        poll.myVoteOptionId === poll.optionA.optionId && styles.pollOptionLabelDark,
                                      ]}
                                    >
                                      {poll.optionA.label}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.pollOptionMeta,
                                        poll.myVoteOptionId === poll.optionA.optionId && styles.pollOptionMetaDark,
                                      ]}
                                    >
                                      {poll.optionA.voteCount}명
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[
                                      styles.pollOptionBox,
                                      poll.myVoteOptionId === poll.optionB.optionId && styles.pollOptionBoxSelected,
                                    ]}
                                    onPress={() => {
                                      void handleVotePoll(poll.pollId, poll.myVoteOptionId, poll.optionB.optionId);
                                    }}
                                    disabled={votePollMutation.isPending}
                                  >
                                    <Text
                                      style={[
                                        styles.pollOptionPercentage,
                                        poll.myVoteOptionId === poll.optionB.optionId && styles.pollOptionPercentageSelected,
                                      ]}
                                    >
                                      {poll.optionB.percentage}%
                                    </Text>
                                    <Text
                                      style={[
                                        styles.pollOptionLabel,
                                        poll.myVoteOptionId === poll.optionB.optionId && styles.pollOptionLabelDark,
                                      ]}
                                    >
                                      {poll.optionB.label}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.pollOptionMeta,
                                        poll.myVoteOptionId === poll.optionB.optionId && styles.pollOptionMetaDark,
                                      ]}
                                    >
                                      {poll.optionB.voteCount}명
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                                <View style={styles.pollVsBadge}>
                                  <Text style={styles.pollVsText}>VS</Text>
                                </View>
                              </View>
                              <Text style={styles.pollTotalVotes}>총 {poll.totalVoteCount}명 참여 중</Text>
                              {votePollMutation.isPending && votePollMutation.variables?.pollId === poll.pollId ? (
                                <Text style={styles.pollPendingText}>투표 반영 중...</Text>
                              ) : !poll.isVoted ? (
                                <Text style={styles.pollPendingText}>아직 참여하지 않은 투표입니다.</Text>
                              ) : (
                                <Text style={styles.pollPendingText}>다시 누르면 취소되고, 다른 쪽을 누르면 변경됩니다.</Text>
                              )}
                              {votePollError?.pollId === poll.pollId ? (
                                <Text style={styles.errorText}>{votePollError.message}</Text>
                              ) : null}
                            </View>
                          ))
                        : null}
                    </>
                  ) : (
                    <CommunityAiTopicsPanel
                      bookTitle={bookDetailQuery.data.title}
                      status={
                        generateCommunityAiTopicsMutation.isPending
                          ? 'loading'
                          : communityAiTopicsQuery.isLoading && !communityAiTopicsQuery.data
                            ? 'loading'
                          : generateCommunityAiTopicsMutation.isError || communityAiTopicsQuery.isError || communityAiTopicsQuery.data?.fetchStatus === 'FAILED' || communityAiTopicsQuery.data?.lastRunStatus === 'FAILED'
                            ? 'error'
                            : communityAiTopicsQuery.data?.fetchStatus === 'GENERATING'
                              ? 'loading'
                              : communityAiTopicsQuery.data?.fetchStatus === 'READY'
                                ? communityAiTopicsQuery.data.topics.length > 0
                                  ? 'success'
                                  : 'empty'
                                : 'idle'
                      }
                      topicSet={communityTopicSet}
                      errorMessage={
                        communityTopicError
                        ?? (generateCommunityAiTopicsMutation.isError ? toUserMessage(generateCommunityAiTopicsMutation.error) : null)
                        ?? (communityAiTopicsQuery.isError ? toUserMessage(communityAiTopicsQuery.error) : null)
                        ?? (communityAiTopicsQuery.data?.lastRunStatus === 'FAILED' ? '커뮤니티 주제 생성에 실패했어요.' : null)
                      }
                      onGenerate={handleGenerateCommunityTopics}
                    />
                  )}
                </ScrollView>
              ) : null}
              {!bookDetailQuery.isLoading
              && !bookDetailQuery.isError
              && bookDetailQuery.data
              && detailTab !== 'TOP_QUOTES'
              && detailTab !== 'AI_TOPICS' ? (
                <TouchableOpacity
                  style={styles.floatingCreateButton}
                  onPress={() => {
                    if (detailTab === 'DISCUSSION') {
                      setCreateDiscussionError(null);
                      setIsCreateDiscussionVisible(true);
                      return;
                    }

                    setCreatePollError(null);
                    setIsCreatePollVisible(true);
                  }}
                >
                  <Text style={styles.floatingCreateButtonIcon}>＋</Text>
                  <Text style={styles.floatingCreateButtonText}>
                    {detailTab === 'DISCUSSION' ? '토론 작성' : '투표 생성'}
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseBookDetail}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>

            {isCreateDiscussionVisible ? (
              <KeyboardAvoidingView
                style={styles.composerOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <View style={styles.composerSheet}>
                  <ScrollView
                    contentContainerStyle={styles.composerContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.composerHandle} />
                    <Text style={styles.composerTitle}>토론 글 작성</Text>
                    <Text style={styles.composerDescription}>이 책을 읽은 사람들과 나누고 싶은 이야기를 작성해보세요.</Text>
                    <Text style={styles.inputLabel}>카테고리</Text>
                    <View style={styles.categoryRow}>
                      {(['QUESTION', 'INTERPRETATION', 'IMPRESSION'] as const).map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[styles.categoryChip, newDiscussionCategory === category && styles.categoryChipActive]}
                          onPress={() => setNewDiscussionCategory(category)}
                        >
                          <Text style={[styles.categoryChipText, newDiscussionCategory === category && styles.categoryChipTextActive]}>
                            {category === 'QUESTION' ? '질문' : category === 'INTERPRETATION' ? '해석' : '감상'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.inputLabel}>제목</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={newDiscussionTitle}
                      onChangeText={setNewDiscussionTitle}
                      placeholder="토론 제목을 입력하세요"
                      placeholderTextColor="#9f968a"
                      returnKeyType="next"
                    />
                    <Text style={styles.inputLabel}>내용</Text>
                    <TextInput
                      style={styles.textArea}
                      value={newDiscussionContent}
                      onChangeText={setNewDiscussionContent}
                      multiline
                      placeholder="토론 내용을 입력하세요"
                      placeholderTextColor="#9f968a"
                    />
                    {createDiscussionError ? <Text style={styles.errorText}>{createDiscussionError}</Text> : null}
                    {createDiscussionMutation.isError ? (
                      <Text style={styles.errorText}>{toUserMessage(createDiscussionMutation.error)}</Text>
                    ) : null}
                    <View style={styles.createFooterRow}>
                      <TouchableOpacity style={styles.cancelButton} onPress={closeDiscussionComposer}>
                        <Text style={styles.cancelButtonText}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.confirmButton, createDiscussionMutation.isPending && styles.buttonDisabled]}
                        onPress={handleCreateDiscussion}
                        disabled={createDiscussionMutation.isPending}
                      >
                        <Text style={styles.confirmButtonText}>
                          {createDiscussionMutation.isPending ? '작성 중...' : '작성 완료'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            ) : null}

            {isCreatePollVisible ? (
              <KeyboardAvoidingView
                style={styles.composerOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <View style={styles.composerSheet}>
                  <ScrollView
                    contentContainerStyle={styles.composerContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.composerHandle} />
                    <Text style={styles.composerTitle}>투표 생성</Text>
                    <Text style={styles.composerDescription}>서로 다른 생각을 확인할 수 있는 질문과 두 선택지를 작성해주세요.</Text>
                    <Text style={styles.inputLabel}>질문</Text>
                    <TextInput
                      style={styles.textArea}
                      value={newPollQuestion}
                      onChangeText={setNewPollQuestion}
                      multiline
                      maxLength={150}
                      placeholder="투표 질문을 입력하세요"
                      placeholderTextColor="#9f968a"
                    />
                    <Text style={styles.inputLabel}>선택지 A</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={newPollOptionA}
                      onChangeText={setNewPollOptionA}
                      maxLength={80}
                      placeholder="예: 공감한다"
                      placeholderTextColor="#9f968a"
                    />
                    <Text style={styles.inputLabel}>선택지 B</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={newPollOptionB}
                      onChangeText={setNewPollOptionB}
                      maxLength={80}
                      placeholder="예: 공감하지 않는다"
                      placeholderTextColor="#9f968a"
                    />
                    {createPollError ? <Text style={styles.errorText}>{createPollError}</Text> : null}
                    {createPollMutation.isError ? <Text style={styles.errorText}>{toUserMessage(createPollMutation.error)}</Text> : null}
                    <View style={styles.createFooterRow}>
                      <TouchableOpacity style={styles.cancelButton} onPress={closePollComposer}>
                        <Text style={styles.cancelButtonText}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.confirmButton, createPollMutation.isPending && styles.buttonDisabled]}
                        onPress={handleCreatePoll}
                        disabled={createPollMutation.isPending}
                      >
                        <Text style={styles.confirmButtonText}>
                          {createPollMutation.isPending ? '생성 중...' : '생성 완료'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            ) : null}

            {selectedDiscussionId !== null ? (
              <DiscussionDetailSheet
                detail={discussionDetailQuery.data}
                coverImageUrl={resolveRemoteImageUrl(discussionDetailQuery.data?.bookCoverImageUrl)}
                comments={discussionCommentsQuery.data?.items ?? []}
                isDetailLoading={discussionDetailQuery.isLoading}
                detailErrorMessage={discussionDetailQuery.isError ? toUserMessage(discussionDetailQuery.error) : null}
                isCommentsLoading={discussionCommentsQuery.isLoading}
                commentsErrorMessage={discussionCommentsQuery.isError ? toUserMessage(discussionCommentsQuery.error) : null}
                likeErrorMessage={toggleDiscussionLikeMutation.isError
                  ? toUserMessage(toggleDiscussionLikeMutation.error)
                  : null}
                commentErrorMessage={createCommentError
                  ?? (createCommentMutation.isError ? toUserMessage(createCommentMutation.error) : null)}
                commentContent={newCommentContent}
                isLikePending={toggleDiscussionLikeMutation.isPending}
                isCommentPending={createCommentMutation.isPending}
                onChangeComment={setNewCommentContent}
                onClose={() => {
                  Keyboard.dismiss();
                  setCreateCommentError(null);
                  setNewCommentContent('');
                  setSelectedDiscussionId(null);
                }}
                onRetryDetail={() => void discussionDetailQuery.refetch()}
                onRetryComments={() => void discussionCommentsQuery.refetch()}
                onToggleLike={() => {
                  if (!discussionDetailQuery.data || toggleDiscussionLikeMutation.isPending) {
                    return;
                  }

                  toggleDiscussionLikeMutation.mutate(discussionDetailQuery.data.discussionId, {
                    onSuccess: async () => {
                      await discussionDetailQuery.refetch();
                      await discussionsQuery.refetch();
                    },
                  });
                }}
                onSubmitComment={handleCreateComment}
              />
            ) : null}
          </View>
        </Modal>

        {showBottomNav ? (
          <BottomNav active="community" onPressCommunity={() => {}} onPressHome={onPressHome} onPressAiChat={onPressAiChat} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function BookCover({
  url,
  size,
}: {
  url: string | null | undefined;
  size: 'small' | 'medium' | 'large';
}) {
  const resolvedCoverUrl = resolveRemoteImageUrl(url);

  const sizeStyle =
    size === 'large'
      ? styles.coverLarge
      : size === 'medium'
        ? styles.coverMedium
        : styles.coverSmall;

  if (resolvedCoverUrl) {
    return <Image source={{ uri: resolvedCoverUrl }} style={[styles.coverImageBase, sizeStyle]} resizeMode="cover" />;
  }

  return (
    <View style={[styles.coverFallbackBase, sizeStyle]}>
      <Text style={styles.coverText}>표지</Text>
    </View>
  );
}

function resolveRemoteImageUrl(url: string | null | undefined): string {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  if (/^(https?:)?\/\//.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return `${API_BASE_URL}/${trimmed}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#44c3f3' },
  container: { flex: 1, paddingTop: 8, backgroundColor: '#44c3f3' },
  topPanel: {
    backgroundColor: '#44c3f3',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  brandTitle: {
    color: '#111',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  homeSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  searchPill: {
    flex: 1,
    minHeight: 40,
    borderRadius: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0d0d0d',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: { fontSize: 16, color: '#111', marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#141414', paddingVertical: 0 },
  scroll: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 14 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 },
  sectionTitleLarge: { fontSize: 12, color: '#111', fontWeight: '700' },
  sectionCountText: { fontSize: 12, color: '#66707a', fontWeight: '600' },
  infoText: { fontSize: 13, color: '#66707a', marginBottom: 10 },
  errorText: { fontSize: 13, color: '#b25555', marginBottom: 8 },
  stateWrap: { marginBottom: 10 },
  retryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#c8beaf',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  retryButtonText: { color: '#5f564b', fontSize: 12, fontWeight: '600' },
  bookCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 0,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bookRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  coverPlaceholder: {
    width: 60,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coverText: { color: '#66707a', fontSize: 11, fontWeight: '600' },
  bookContent: { flex: 1 },
  bookTitle: { fontSize: 13, color: '#111', fontWeight: '700', marginBottom: 4 },
  bookAuthor: { fontSize: 11, color: '#66707a', marginBottom: 6 },
  bookMeta: { fontSize: 10, color: '#66707a' },
  previewBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    padding: 10,
  },
  previewLabel: { fontSize: 10, color: '#66707a', fontWeight: '700', marginBottom: 4 },
  previewText: { fontSize: 12, color: '#111', lineHeight: 18 },
  smallCard: {
    minHeight: 92,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  smallCardTitle: { fontSize: 12, color: '#111', fontWeight: '600' },
  popularBookRow: { flexDirection: 'row', alignItems: 'center' },
  popularCoverPlaceholder: {
    width: 50,
    height: 62,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bottomNav: {
    height: 84,
    borderTopWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#44c3f3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  bottomItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 8 },
  bottomIcon: { fontSize: 22, color: '#111', marginBottom: 5 },
  bottomLabel: { fontSize: 11, color: '#111', fontWeight: '700' },
  bottomLabelActive: { fontSize: 11, color: '#fff', fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(32, 26, 20, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    padding: 16,
    maxHeight: '88%',
  },
  bookDetailModalCard: {
    height: '88%',
    position: 'relative',
  },
  bookDetailScroll: {
    flex: 1,
  },
  bookDetailScrollContent: {
    paddingBottom: 84,
  },
  modalTitle: { fontSize: 16, color: '#111', fontWeight: '700', marginBottom: 10 },
  detailHeaderCard: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    padding: 12,
    marginBottom: 12,
  },
  detailHelperText: { fontSize: 12, color: '#111', fontWeight: '600' },
  detailTabRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  detailTabButton: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  detailTabButtonActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  detailTabButtonText: { fontSize: 11, color: '#111', fontWeight: '700' },
  detailTabButtonTextActive: { color: '#44c3f3' },
  quoteRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 8,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 0,
    backgroundColor: '#44c3f3',
    borderWidth: 1,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankBadgeText: { color: '#111', fontSize: 13, fontWeight: '800' },
  rankContent: { flex: 1 },
  rankQuoteText: { color: '#111', fontSize: 13, marginBottom: 4, fontWeight: '600' },
  rankMetaText: { color: '#444', fontSize: 11 },
  discussionCard: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 8,
  },
  discussionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#e8f6ef',
    marginBottom: 6,
  },
  discussionBadgeText: { color: '#7d8d73', fontSize: 10, fontWeight: '700' },
  discussionTitle: { color: '#111', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  discussionPreview: { color: '#3f3f3f', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  discussionMeta: { color: '#666', fontSize: 11 },
  discussionActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeInlineText: { color: '#111', fontSize: 12, fontWeight: '700' },
  floatingCreateButton: {
    position: 'absolute',
    right: 16,
    bottom: 58,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 17,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },
  floatingCreateButtonIcon: { color: '#111', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  floatingCreateButtonText: { color: '#111', fontSize: 12, fontWeight: '800' },
  pollCard: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 10,
  },
  pollQuestion: { color: '#111', fontSize: 18, fontWeight: '700', marginBottom: 14, letterSpacing: -0.2 },
  pollOptionsWrap: { position: 'relative', marginBottom: 18 },
  pollOptionsRow: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between', gap: 12 },
  pollOptionBox: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  pollOptionBoxSelected: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  pollVsBadge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: -30,
    marginTop: -30,
    backgroundColor: '#44c3f3',
    borderWidth: 1,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollVsText: { color: '#111', fontSize: 22, fontWeight: '800', letterSpacing: -0.2 },
  pollOptionPercentage: { color: '#44c3f3', fontSize: 46, fontWeight: '700', lineHeight: 50, letterSpacing: -1 },
  pollOptionPercentageSelected: { color: '#44c3f3' },
  pollOptionLabel: { color: '#111', fontSize: 17, fontWeight: '700', marginTop: 2, letterSpacing: -0.2 },
  pollOptionLabelDark: { color: '#fff' },
  pollOptionMeta: { color: '#666', fontSize: 13, fontWeight: '500', marginTop: 4 },
  pollOptionMetaDark: { color: '#fff' },
  pollTotalVotes: { color: '#666', fontSize: 15, textAlign: 'center', fontWeight: '500' },
  pollPendingText: { color: '#666', fontSize: 11, marginTop: 6, textAlign: 'center' },
  composerOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 17, 17, 0.48)',
  },
  composerSheet: {
    width: '100%',
    maxHeight: '84%',
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderColor: '#111',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  composerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  composerHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#111',
    marginBottom: 14,
  },
  composerTitle: { color: '#111', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  composerDescription: { color: '#66707a', fontSize: 12, lineHeight: 18, marginBottom: 18 },
  inputLabel: { color: '#66707a', fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 2 },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  categoryChip: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryChipActive: { borderColor: '#111', backgroundColor: '#111' },
  categoryChipText: { color: '#111', fontSize: 11, fontWeight: '700' },
  categoryChipTextActive: { color: '#44c3f3' },
  inputBox: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    minHeight: 38,
    marginBottom: 8,
    color: '#352f27',
  },
  textArea: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 10,
    minHeight: 92,
    marginBottom: 8,
    color: '#352f27',
    textAlignVertical: 'top',
  },
  createFooterRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  cancelButton: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cancelButtonText: { color: '#111', fontSize: 12, fontWeight: '800' },
  confirmButton: {
    borderRadius: 0,
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  buttonDisabled: { opacity: 0.55 },
  confirmButtonText: { color: '#44c3f3', fontSize: 12, fontWeight: '800' },
  closeButton: {
    alignSelf: 'flex-end',
    borderRadius: 0,
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: { color: '#44c3f3', fontSize: 12, fontWeight: '800' },
  coverImageBase: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#111',
    marginRight: 10,
  },
  coverFallbackBase: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#111',
    marginRight: 10,
  },
  coverSmall: { width: 44, height: 56 },
  coverMedium: { width: 62, height: 80 },
  coverLarge: { width: 86, height: 110 },
});

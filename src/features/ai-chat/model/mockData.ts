import {
  DeepReadingChatPreview,
  DeepReadingMessage,
  DeepReadingQuoteSource,
  DeepReadingStarterQuestion,
} from './deepReadingChat.types';

export const mockRecentDeepReadingChats: DeepReadingChatPreview[] = [
  {
    chatId: 101,
    title: '말과 사유의 어긋남',
    preview: '표현하는 순간 생각이 달라지는 경험을 더 파고들어볼까요?',
    messageCount: 8,
    sessionStatus: 'active',
    lastMessageAt: '오늘 15:10',
    quoteSource: {
      quoteId: 301,
      bookId: 1,
      bookTitle: '델리쿠르 등 백작부인',
      author: '마르그리트 뒤라스',
      pageNumber: 23,
      quoteText: '우리는 말을 하면서 사유할 수 없다. 말은 생각을 비판한다.',
      folderId: 11,
      folderName: '생각의 틈',
      emotionType: 'THINKING',
      emotionLabel: '생각',
    },
  },
  {
    chatId: 102,
    title: '슬픔과 익숙함',
    preview: '이 문장이 현재 감정과 어떻게 겹치는지 이야기해볼 수 있어요.',
    messageCount: 12,
    sessionStatus: 'closed',
    lastMessageAt: '어제 22:41',
    quoteSource: {
      quoteId: 302,
      bookId: 2,
      bookTitle: '우리가 빛의 속도로 갈 수 없다면',
      author: '김초엽',
      pageNumber: 118,
      quoteText: '슬픔은 시간이 지나면 사라지는 것이 아니라, 익숙해지는 것이다.',
      folderId: 12,
      folderName: '감정의 언어',
      emotionType: 'SAD',
      emotionLabel: '슬픔',
    },
  },
];

export const mockStoredQuotes: DeepReadingQuoteSource[] = [
  {
    quoteId: 301,
    bookId: 1,
    bookTitle: '델리쿠르 등 백작부인',
    author: '마르그리트 뒤라스',
    pageNumber: 23,
    quoteText: '우리는 말을 하면서 사유할 수 없다. 말은 생각을 비판한다.',
    folderId: 11,
    folderName: '생각의 틈',
    emotionType: 'THINKING',
    emotionLabel: '생각',
  },
  {
    quoteId: 302,
    bookId: 2,
    bookTitle: '우리가 빛의 속도로 갈 수 없다면',
    author: '김초엽',
    pageNumber: 118,
    quoteText: '슬픔은 시간이 지나면 사라지는 것이 아니라, 익숙해지는 것이다.',
    folderId: 12,
    folderName: '감정의 언어',
    emotionType: 'SAD',
    emotionLabel: '슬픔',
  },
  {
    quoteId: 303,
    bookId: 3,
    bookTitle: '82년생 김지영',
    author: '조남주',
    pageNumber: 77,
    quoteText: '나는 나의 삶을 살고 있는가, 아니면 누군가의 기대에 부응하고 있는가?',
    folderId: null,
    folderName: null,
    emotionType: 'SELF_REFLECTION',
    emotionLabel: '자기 성찰',
  },
];

export const mockDeepReadingMessages: DeepReadingMessage[] = [
  {
    id: 'assistant-1',
    role: 'assistant',
    text: '좋아요. 이 문장을 단순 해석보다 경험과 연결하는 방식으로 천천히 읽어볼게요.',
    createdAt: '15:02',
  },
  {
    id: 'user-1',
    role: 'user',
    text: '이 문장이 왜 불편하게 남는지 잘 모르겠어요.',
    createdAt: '15:04',
  },
  {
    id: 'assistant-2',
    role: 'assistant',
    text: '말이 생각을 도와주는 도구이면서도, 동시에 생각을 납작하게 만들 수 있다는 감각이 들어서일 수 있어요.',
    createdAt: '15:05',
  },
];

export const mockQuickPrompts: DeepReadingStarterQuestion[] = [
  {
    id: 'self-reflection',
    type: 'self_reflection',
    question: '이 문장이 마음에 남은 이유를 같이 짚어줘',
  },
  {
    id: 'author-intent',
    type: 'author_intent',
    question: '왜 이 문장이 인상 깊었을까?',
  },
  {
    id: 'core-tension',
    type: 'core_tension',
    question: '이 문장을 쉽게 해석해줘',
  },
  {
    id: 'counter-view',
    type: 'counter_view',
    question: '내 상황과 연결해서 생각해줘',
  },
  {
    id: 'similar-lines',
    type: 'similar_line',
    question: '비슷한 문장도 추천해줘',
  },
];

import { getJson, postJson } from '../../../shared/api/httpClient';
import { ApiError } from '../../../shared/utils/apiError';
import {
  toHomeCardDetailResult,
  toHomeCardsFilterResult,
  toHomeCardsResult,
  toReactToCardResult,
  toReactionEmojiOptions,
  toHomeCardsSearchResult,
} from '../model/home.mapper';
import {
  HomeCardDetailResponseDto,
  ReactToCardResponseDto,
  ReactionEmojisResponseDto,
  HomeCardsFilterResponseDto,
  HomeCardsResponseDto,
  HomeCardsSearchResponseDto,
} from '../model/home.dto';
import {
  HomeCardDetailResult,
  ReactToCardInput,
  ReactToCardResult,
  HomeCardsFilterQuery,
  HomeCardsQuery,
  HomeCardsResult,
  HomeCardsSearchQuery,
  ReactionEmojiOption,
} from '../model/home.types';

type ServiceDebugInfo = {
  serviceName: string;
  cause: unknown;
  meta?: Record<string, unknown>;
};

export class HomeServiceError extends Error {
  userMessage: string;
  debugInfo: ServiceDebugInfo;

  constructor(userMessage: string, debugInfo: ServiceDebugInfo) {
    super(userMessage);
    this.name = 'HomeServiceError';
    this.userMessage = userMessage;
    this.debugInfo = debugInfo;
  }
}

function wrapServiceError(
  serviceName: string,
  userMessage: string,
  error: unknown,
  meta?: Record<string, unknown>,
): HomeServiceError {
  const debugInfo: ServiceDebugInfo = { serviceName, cause: error, meta };
  console.error(`[${serviceName}]`, debugInfo);
  return new HomeServiceError(userMessage, debugInfo);
}

function buildHomeCardsQueryString(params: HomeCardsQuery): string {
  const query = new URLSearchParams();
  query.set('view', params.view);
  if ('q' in params && typeof params.q === 'string') query.set('q', params.q);
  if ('category' in params && typeof params.category === 'string') query.set('category', params.category);
  if ('emojiType' in params && typeof params.emojiType === 'string') query.set('emojiType', params.emojiType);
  if ('folderId' in params && typeof params.folderId === 'number') query.set('folderId', String(params.folderId));

  if (params.cursor) query.set('cursor', params.cursor);
  if (typeof params.size === 'number') query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);

  return query.toString();
}

export async function getHomeCards(params: HomeCardsQuery): Promise<HomeCardsResult> {
  const query = buildHomeCardsQueryString(params);
  const path = `/api/v1/home/cards?${query}`;
  try {
    const response = await getJson<HomeCardsResponseDto>(path, {
      auth: true,
    });

    return toHomeCardsResult(response);
  } catch (error) {
    throw wrapServiceError('getHomeCards', '홈 카드 목록을 불러오지 못했어요.', error, { path, params });
  }
}

export async function searchHomeCards(params: HomeCardsSearchQuery): Promise<HomeCardsResult> {
  const query = buildHomeCardsQueryString(params);
  const path = `/api/v1/home/cards/search?${query}`;
  try {
    const response = await getJson<HomeCardsSearchResponseDto>(path, {
      auth: true,
    });

    return toHomeCardsSearchResult(response);
  } catch (error) {
    throw wrapServiceError('searchHomeCards', '검색 결과를 불러오지 못했어요.', error, { path, params });
  }
}

export async function getHomeCardsByFilter(params: HomeCardsFilterQuery): Promise<HomeCardsResult> {
  const query = buildHomeCardsQueryString(params);
  const path = `/api/v1/home/cards/filter?${query}`;
  try {
    const response = await getJson<HomeCardsFilterResponseDto>(path, {
      auth: true,
    });

    return toHomeCardsFilterResult(response);
  } catch (error) {
    if (error instanceof ApiError && error.status >= 500 && params.sort === 'MOST_REACTED') {
      const fallbackParams: HomeCardsFilterQuery = {
        ...params,
        sort: 'LATEST',
      };
      const fallbackQuery = buildHomeCardsQueryString(fallbackParams);
      const fallbackPath = `/api/v1/home/cards/filter?${fallbackQuery}`;

      try {
        const response = await getJson<HomeCardsFilterResponseDto>(fallbackPath, {
          auth: true,
        });

        return toHomeCardsFilterResult(response);
      } catch (fallbackError) {
        throw wrapServiceError('getHomeCardsByFilter', '필터 카드 목록을 불러오지 못했어요.', fallbackError, {
          path,
          params,
          fallbackPath,
          fallbackParams,
        });
      }
    }

    throw wrapServiceError('getHomeCardsByFilter', '필터 카드 목록을 불러오지 못했어요.', error, { path, params });
  }
}

export async function getHomeCardDetail(cardId: number): Promise<HomeCardDetailResult> {
  const path = `/api/v1/home/cards/${cardId}`;
  try {
    const response = await getJson<HomeCardDetailResponseDto>(path, {
      auth: true,
    });

    return toHomeCardDetailResult(response);
  } catch (error) {
    throw wrapServiceError('getHomeCardDetail', '카드 상세 정보를 불러오지 못했어요.', error, { path, cardId });
  }
}

export async function getReactionEmojis(): Promise<ReactionEmojiOption[]> {
  const path = '/api/v1/home/cards/reactions/emojis';
  try {
    const response = await getJson<ReactionEmojisResponseDto>(path, {
      auth: true,
    });

    return toReactionEmojiOptions(response);
  } catch (error) {
    throw wrapServiceError('getReactionEmojis', '이모지 목록을 불러오지 못했어요.', error, { path });
  }
}

export async function reactToCard(input: ReactToCardInput): Promise<ReactToCardResult> {
  const path = `/api/v1/home/cards/${input.cardId}/reactions`;
  try {
    const response = await postJson<ReactToCardResponseDto>(path, {
      auth: true,
      body: {
        emojiType: input.emojiType,
      },
    });

    return toReactToCardResult(response);
  } catch (error) {
    throw wrapServiceError('reactToCard', '이모지 반응 처리에 실패했어요.', error, { path, input });
  }
}

import { getJson } from '../../../shared/api/httpClient';
import { toHomeCardsFilterResult, toHomeCardsResult, toHomeCardsSearchResult } from '../model/home.mapper';
import { HomeCardsFilterResponseDto, HomeCardsResponseDto, HomeCardsSearchResponseDto } from '../model/home.dto';
import { HomeCardsFilterQuery, HomeCardsQuery, HomeCardsResult, HomeCardsSearchQuery } from '../model/home.types';

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
  const response = await getJson<HomeCardsResponseDto>(`/api/v1/home/cards?${query}`, {
    auth: true,
  });

  return toHomeCardsResult(response);
}

export async function searchHomeCards(params: HomeCardsSearchQuery): Promise<HomeCardsResult> {
  const query = buildHomeCardsQueryString(params);
  const response = await getJson<HomeCardsSearchResponseDto>(`/api/v1/home/cards/search?${query}`, {
    auth: true,
  });

  return toHomeCardsSearchResult(response);
}

export async function getHomeCardsByFilter(params: HomeCardsFilterQuery): Promise<HomeCardsResult> {
  const query = buildHomeCardsQueryString(params);
  const response = await getJson<HomeCardsFilterResponseDto>(`/api/v1/home/cards/filter?${query}`, {
    auth: true,
  });

  return toHomeCardsFilterResult(response);
}

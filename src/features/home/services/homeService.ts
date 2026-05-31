import { getJson } from '../../../shared/api/httpClient';
import { toHomeCardsResult } from '../model/home.mapper';
import { HomeCardsResponseDto } from '../model/home.dto';
import { HomeCardsQuery, HomeCardsResult } from '../model/home.types';

function buildHomeCardsQueryString(params: HomeCardsQuery): string {
  const query = new URLSearchParams();
  query.set('view', params.view);

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

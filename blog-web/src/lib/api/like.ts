import { fetchClient } from './client';

export type LikeContentType = 'ARTICLE' | 'TALK';
export type LikeAction = 'LIKE' | 'UNLIKE' | 'TOGGLE';

export const likeApi = {
  status: (params: { visitorUuid: string; contentType: LikeContentType; contentId: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('visitorUuid', params.visitorUuid);
    searchParams.set('contentType', params.contentType);
    searchParams.set('contentId', String(params.contentId));
    return fetchClient<{ liked: boolean; likeCount: number }>(
      `/api/public/like/status?${searchParams.toString()}`,
      { method: 'GET', silent: true }
    );
  },

  action: (body: { visitorUuid: string; contentType: LikeContentType; contentId: number; action: LikeAction }) => {
    return fetchClient<{ visitorUuid: string; liked: boolean; likeCount: number }>(`/api/public/like`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};


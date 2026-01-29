import { fetchServer } from './server';
import type { FriendLinkVO, FriendLinkApplicationDTO } from '@/types';

export const friendLinkApi = {
  getList: () => {
    return fetchServer<FriendLinkVO[]>('/api/public/friend-link/list', {
      next: { tags: ['friendlink:list'] },
    });
  },

  apply: (data: FriendLinkApplicationDTO) => {
    return fetchServer<void>('/api/public/friend-link/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};


import { fetchServer } from './server';
import type { FriendLinkVO } from '@/types';

export const friendLinkApi = {
  getList: () => {
    return fetchServer<FriendLinkVO[]>('/api/public/friend-link/list');
  },
};


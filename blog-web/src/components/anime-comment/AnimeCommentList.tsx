'use client';

import { AnimeCommentConfig } from './types';
import AnimeCommentItem from './AnimeCommentItem';
import { getRandomAnimeAvatar } from './constants';

interface AnimeCommentListProps {
  comments: any[];
  loading: boolean;
  onReply: (commentId: number, nickname: string) => void;
  config: AnimeCommentConfig;
}

/**
 * 二次元评论列表组件
 */
export default function AnimeCommentList({
  comments,
  loading,
  onReply,
  config,
}: AnimeCommentListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
            ✿
          </div>
        </div>
        <p className="mt-4 text-gray-500">加载评论中...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-float">｡ﾟ(ﾟ´Д｀)ﾟ｡</div>
        <p className="text-gray-500 text-lg">还没有评论哦，快来抢沙发吧~</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <AnimeCommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          config={config}
          depth={0}
        />
      ))}
    </div>
  );
}

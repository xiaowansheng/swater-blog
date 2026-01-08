'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils/format';
import { AnimeCommentConfig } from './types';
import { getRandomAnimeAvatar } from './constants';

interface AnimeCommentItemProps {
  comment: any;
  onReply: (commentId: number, nickname: string) => void;
  config: AnimeCommentConfig;
  depth: number;
}

/**
 * 二次元评论项组件
 */
export default function AnimeCommentItem({
  comment,
  onReply,
  config,
  depth,
}: AnimeCommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const avatar = comment.avatar || getRandomAnimeAvatar(comment.nickname);

  // 最大嵌套深度
  const MAX_DEPTH = 3;
  const isNested = depth > 0;
  const canNestMore = depth < MAX_DEPTH;

  // 获取边框颜色类
  const getBorderClass = () => {
    const colors = [
      'border-pink-200',
      'border-purple-200',
      'border-blue-200',
      'border-green-200',
    ];
    return colors[depth % colors.length];
  };

  // 获取背景颜色类
  const getBgClass = () => {
    const bgs = [
      'from-pink-50/50',
      'from-purple-50/50',
      'from-blue-50/50',
      'from-green-50/50',
    ];
    return bgs[depth % bgs.length];
  };

  return (
    <div
      className={`animate-fade-in ${isNested ? 'ml-8 md:ml-12' : ''}`}
      style={{ animationDelay: `${depth * 0.1}s` }}
    >
      <div className={`bg-gradient-to-br ${getBgClass()} to-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 ${getBorderClass()} shadow-sm hover:shadow-md transition-all duration-300 relative group`}>
        {/* 装饰元素 */}
        {!isNested && (
          <>
            <div className="absolute -top-2 -right-2 text-2xl opacity-30 group-hover:opacity-60 transition-opacity">
              ✿
            </div>
            <div className="absolute -bottom-1 -left-1 text-xl opacity-20 group-hover:opacity-40 transition-opacity">
              ✦
            </div>
          </>
        )}

        {/* 评论头部 */}
        <div className="flex items-start gap-4">
          {/* 头像 */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-3 border-pink-300 shadow-md group-hover:scale-110 transition-transform duration-300">
              <img
                src={avatar}
                alt={comment.nickname}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 text-xs animate-pulse">✨</div>
          </div>

          {/* 评论内容 */}
          <div className="flex-1 min-w-0">
            {/* 昵称和时间 */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-bold text-gray-800 text-base">
                {comment.nickname}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(comment.createTime, 'YYYY-MM-DD HH:mm')}
              </span>
              {isNested && comment.replyTo && (
                <span className="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
                  回复
                </span>
              )}
            </div>

            {/* 评论内容 */}
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </div>

            {/* 评论图片 */}
            {comment.images && comment.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {comment.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`评论图片 ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-pink-200 hover:border-pink-400 transition-colors cursor-pointer"
                  />
                ))}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => onReply(comment.id, comment.nickname)}
                className="text-sm text-pink-500 hover:text-pink-600 flex items-center gap-1 transition-colors group/btn"
              >
                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                回复
              </button>
            </div>
          </div>
        </div>

        {/* 子评论展开/收起按钮 */}
        {comment.children && comment.children.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-sm text-purple-500 hover:text-purple-600 flex items-center gap-1 transition-colors"
          >
            {isExpanded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                收起 {comment.children.length} 条回复
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                展开 {comment.children.length} 条回复
              </>
            )}
          </button>
        )}
      </div>

      {/* 子评论 */}
      {isExpanded && comment.children && comment.children.length > 0 && canNestMore && (
        <div className="mt-4 space-y-4">
          {comment.children.map((child: any) => (
            <AnimeCommentItem
              key={child.id}
              comment={child}
              onReply={onReply}
              config={config}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

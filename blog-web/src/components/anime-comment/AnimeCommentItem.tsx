'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { formatDate } from '@/lib/utils/format';
import { CommentStatus, CommentVisibilityStatus, type CommentVO, type PrivacyConfig } from '@/types';
import { AnimeCommentConfig } from './types';
import { getRandomAnimeAvatar } from './constants';
import ReplyForm from './ReplyForm';
import { Card } from '@/components/ui/Card';
import { UAList } from '@/components/common/UAIcon';

interface ReplyState {
  items: CommentVO[];
  page: number;
  pages: number;
  loading: boolean;
  expanded: boolean;
}

function formatIp(ip: string | undefined): string {
  return ip || '';
}

interface AnimeCommentItemProps {
  comment: CommentVO;
  replyState?: ReplyState;
  onToggleReplies: (commentId: number, replyCount?: number) => void;
  onLoadMoreReplies: (commentId: number) => void;
  onReply: (commentId: number) => void;
  activeReplyFormId: number | null;
  onCloseReplyForm: () => void;
  onReplySubmitSuccess: (rootId: number) => void;
  targetType: 'ARTICLE' | 'TALK';
  targetId: number;
  config: AnimeCommentConfig;
  privacy: PrivacyConfig;
}

function getStatusLabel(status: CommentStatus | undefined, t: (key: string) => string) {
  if (status === CommentStatus.APPROVED || status === undefined) return null;
  if (status === CommentStatus.PENDING) return t('pending');
  if (status === CommentStatus.REJECTED) return t('rejected');
  return t('hidden');
}

// 格式化位置信息
function formatLocation(
  country: string | undefined,
  province: string | undefined,
  city: string | undefined,
  location: string | undefined,
  ipLocation: string | undefined
): string {
  // 优先使用经纬度解析的 location
  if (location) return location;

  // 其次使用 IP 解析的 ipLocation
  if (ipLocation) return ipLocation;

  // 最后才拼接 country, province, city
  const parts = [];
  if (country && country !== '中国') {
    parts.push(country);
  }
  if (province) {
    parts.push(province);
  }
  if (city && city !== province) {
    parts.push(city);
  }
  return parts.length > 0 ? parts.join(' · ') : '';
}

export default function AnimeCommentItem({
  comment,
  replyState,
  onToggleReplies,
  onLoadMoreReplies,
  onReply,
  activeReplyFormId,
  onCloseReplyForm,
  onReplySubmitSuccess,
  targetType,
  targetId,
  config,
  privacy,
}: AnimeCommentItemProps) {
  const t = useTranslations('comment');
  const avatar = comment.avatar || getRandomAnimeAvatar(comment.nickname);
  const showReplyForm = activeReplyFormId === comment.id;
  const statusLabel = useMemo(() => getStatusLabel(comment.status, t), [comment.status, t]);
  const replies = replyState?.items || [];
  const expanded = replyState?.expanded;
  const hasMoreReplies = replyState ? replyState.page < replyState.pages : false;
  const rootId = comment.rootId && comment.rootId > 0 ? comment.rootId : comment.id;
  const isDirectChild = !comment.parentId || comment.parentId === 0 || comment.parentId === rootId;
  const parentId = comment.parentId ?? 0;
  const isHiddenByModeration = comment.isVisible === CommentVisibilityStatus.HIDDEN;

  return (
    <div className="animate-fade-in">
      <Card className="p-5 relative group" variant="glass">
        {/* 第一部分：头像和作者信息 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-primary/30 shadow-md group-hover:scale-110 transition-transform duration-300">
              <img
                src={avatar}
                alt={comment.nickname}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 text-xs animate-pulse">✨</div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground text-base">
                {comment.nickname}
              </span>
              <span className="text-xs text-muted-foreground">
                #{comment.id}
                {!isDirectChild && comment.parentId && comment.parentId > 0 && (
                  <> → #{comment.parentId}</>
                )}
              </span>
              {comment.isAuthor && (
                <span className="text-xs text-white bg-primary px-2 py-0.5 rounded-full">
                  {t('author')}
                </span>
              )}
              {statusLabel && comment.isOwner && (
                <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                  {statusLabel}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.createTime, 'YYYY-MM-DD HH:mm')}
            </span>
          </div>
        </div>

        {/* 第二部分：评论内容 */}
        <div className="text-card-foreground leading-relaxed whitespace-pre-wrap break-words mb-3">
          {isHiddenByModeration && <span className="text-muted-foreground italic">{t('commentHidden')} </span>}
          {comment.replyToUser?.nickname && (
            <span className="text-primary">@{comment.replyToUser.nickname} </span>
          )}
          {comment.content}
        </div>

        {/* 第三部分：地址和设备信息 */}
        {(() => {
          const locationText = privacy.showLocation
            ? formatLocation(comment.country, comment.province, comment.city, comment.location, comment.ipLocation)
            : '';
          const ipText = privacy.showIp ? formatIp(comment.ip) : '';
          const hasMeta = Boolean(locationText || ipText)
            || ((privacy.showDevice || privacy.showBrowser) && (comment.device || comment.browser));

          if (!hasMeta) return null;

          return (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground border-t border-border/50 pt-3">
              {locationText && (
                <span className="flex items-center gap-1 min-w-0 group/location">
                  <svg className="w-3.5 h-3.5 text-primary/60 group-hover/location:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate max-w-[14rem] sm:max-w-none">{locationText}</span>
                </span>
              )}
              {ipText && (
                <span className="flex items-center gap-1 min-w-0 group/ip">
                  <svg className="w-3.5 h-3.5 text-primary/60 group-hover/ip:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                  </svg>
                  <span className="truncate max-w-[10rem] sm:max-w-none">{ipText}</span>
                </span>
              )}
              {(privacy.showDevice || privacy.showBrowser) && (comment.device || comment.browser) && (
                <UAList 
                  device={privacy.showDevice ? comment.device : undefined} 
                  browser={privacy.showBrowser ? comment.browser : undefined}
                />
              )}
            </div>
          );
        })()}
        {/* 操作按钮 */}
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => onReply(comment.id)}
            className={`text-sm flex items-center gap-1 transition-colors group/btn ${
              showReplyForm
                ? 'text-primary hover:text-primary/80'
                : 'text-accent hover:text-accent/80'
            }`}
          >
            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            {showReplyForm ? t('collapseReply') : t('reply')}
          </button>
          {typeof comment.replyCount === 'number' && comment.replyCount > 0 && (
            <button
              onClick={() => onToggleReplies(comment.id, comment.replyCount)}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              {expanded ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {t('collapseReplies', { count: comment.replyCount })}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {t('expandReplies', { count: comment.replyCount })}
                </>
              )}
            </button>
          )}
        </div>
      </Card>

      {/* 回复表单 */}
      {showReplyForm && (
        <ReplyForm
          parentId={comment.id}
          rootId={rootId}
          parentNickname={comment.nickname}
          targetType={targetType}
          targetId={targetId}
          config={config}
          onSubmitSuccess={() => onReplySubmitSuccess(rootId)}
          onCancel={onCloseReplyForm}
        />
      )}

      {/* 回复列表 */}
      {expanded && (
        <div className="mt-4 ml-8 md:ml-12 space-y-4">
          {replyState?.loading && (
            <div className="text-sm text-muted-foreground">{t('loading')}</div>
          )}
          {!replyState?.loading && replies.length === 0 && (
            <div className="text-sm text-muted-foreground">{t('noReplies')}</div>
          )}
          {replies.map((child) => (
            <Card
              key={child.id}
              className="bg-card/80 border border-card-border rounded-xl p-4 shadow-sm"
              variant="default" // Using default since it's nested
            >
              {/* 第一部分：头像和作者信息 */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={child.avatar || getRandomAnimeAvatar(child.nickname)}
                  alt={child.nickname}
                  className="w-10 h-10 rounded-full border-2 border-primary/30"
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">{child.nickname}</span>
                    <span className="text-xs text-muted-foreground">
                      #{child.id}
                      {child.parentId && child.parentId !== child.rootId && (
                        <> → #{child.parentId}</>
                      )}
                    </span>
                    {child.isAuthor && (
                      <span className="text-xs text-white bg-primary px-2 py-0.5 rounded-full">
                        {t('author')}
                      </span>
                    )}
                    {getStatusLabel(child.status, t) && child.isOwner && (
                      <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                        {getStatusLabel(child.status, t)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(child.createTime, 'YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              </div>

              {/* 第二部分：回复内容 */}
              <div className="text-card-foreground whitespace-pre-wrap break-words mb-3">
                {child.isVisible === CommentVisibilityStatus.HIDDEN && <span className="text-muted-foreground italic">{t('commentHidden')} </span>}
                {child.replyToUser?.nickname && (
                  <span className="text-primary">@{child.replyToUser.nickname} </span>
                )}
                {child.content}
              </div>

              {/* 第三部分：地址和设备信息 */}
              {(() => {
                const locationText = privacy.showLocation
                  ? formatLocation(child.country, child.province, child.city, child.location, child.ipLocation)
                  : '';
                const ipText = privacy.showIp ? formatIp(child.ip) : '';
                const hasMeta = Boolean(locationText || ipText)
                  || ((privacy.showDevice || privacy.showBrowser) && (child.device || child.browser));

                if (!hasMeta) return null;

                return (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground border-t border-border/50 pt-3">
                    {locationText && (
                      <span className="flex items-center gap-1 min-w-0 group/location">
                        <svg className="w-3.5 h-3.5 text-primary/60 group-hover/location:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate max-w-[14rem] sm:max-w-none">{locationText}</span>
                      </span>
                    )}
                    {ipText && (
                <span className="flex items-center gap-1 min-w-0 group/ip">
                  <svg className="w-3.5 h-3.5 text-primary/60 group-hover/ip:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                  </svg>
                  <span className="truncate max-w-[10rem] sm:max-w-none">{ipText}</span>
                </span>
              )}
                    {(privacy.showDevice || privacy.showBrowser) && (child.device || child.browser) && (
                      <UAList 
                        device={privacy.showDevice ? child.device : undefined} 
                        browser={privacy.showBrowser ? child.browser : undefined}
                      />
                    )}
                  </div>
                );
              })()}
              {/* 回复按钮和表单 */}
              <div className="mt-2">
                <button
                  onClick={() => onReply(child.id)}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  {t('reply')}
                </button>
                {activeReplyFormId === child.id && (
                  <div className="mt-3">
                    <ReplyForm
                      parentId={child.id}
                      rootId={rootId}
                      parentNickname={child.nickname}
                      targetType={targetType}
                      targetId={targetId}
                      config={config}
                      onSubmitSuccess={() => onReplySubmitSuccess(rootId)}
                      onCancel={onCloseReplyForm}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
          {hasMoreReplies && (
            <button
              type="button"
              onClick={() => onLoadMoreReplies(comment.id)}
              disabled={replyState?.loading}
              className="text-sm text-primary hover:text-primary/80"
            >
              {replyState?.loading ? t('loading') : t('loadMore')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

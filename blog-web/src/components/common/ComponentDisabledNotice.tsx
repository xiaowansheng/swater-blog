interface ComponentDisabledNoticeProps {
  type: 'guestbook' | 'comment' | 'talk-comment';
}

export default function ComponentDisabledNotice({ type }: ComponentDisabledNoticeProps) {
  const getNoticeContent = () => {
    switch (type) {
      case 'guestbook':
        return {
          emoji: '📝',
          title: '留言功能暂时关闭',
          message: '博主暂时关闭了留言功能，你可以通过其他方式联系我哦~',
          color: 'from-blue-400 to-purple-400'
        };
      case 'comment':
        return {
          emoji: '💬',
          title: '评论功能暂时关闭',
          message: '博主暂时关闭了评论功能，感谢你的理解~',
          color: 'from-pink-400 to-rose-400'
        };
      case 'talk-comment':
        return {
          emoji: '✨',
          title: '说说评论暂时关闭',
          message: '说说评论功能暂时关闭，可以看看其他内容哦~',
          color: 'from-purple-400 to-pink-400'
        };
    }
  };

  const content = getNoticeContent();

  return (
    <div className="relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03] rounded-3xl blur-2xl"></div>

      {/* 主体卡片 */}
      <div className="relative bg-gradient-to-br from-white/80 via-secondary/40 to-primary/10 backdrop-blur-xl rounded-3xl border border-primary/15 shadow-lg overflow-hidden">
        {/* 顶部装饰条 */}
        <div className={`h-2 bg-gradient-to-r ${content.color}`}></div>

        {/* 内容区域 */}
        <div className="p-12 text-center">
          {/* Emoji 动画 */}
          <div className="mb-6 relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative text-8xl animate-bounce" style={{ animationDuration: '2s' }}>
              {content.emoji}
            </div>
          </div>

          {/* 标题 */}
          <h3 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${content.color} bg-clip-text text-transparent`}>
            {content.title}
          </h3>

          {/* 描述文本 */}
          <p className="text-muted-foreground text-lg mb-8 relative">
            {/* 装饰星星 */}
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 text-primary/20 text-sm">✦</span>
            {content.message}
            <span className="absolute -right-4 top-1/2 -translate-y-1/2 text-accent/20 text-sm">✧</span>
          </p>

          {/* 底部装饰星星 */}
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-primary/30">✦</span>
            <span className="text-accent/30">✧</span>
            <span className="text-pink-300/30">✦</span>
          </div>
        </div>

        {/* 右下角装饰 */}
        <div className="absolute bottom-4 right-4 text-primary/5 text-6xl font-bold">♪</div>
        <div className="absolute top-4 left-4 text-accent/5 text-4xl">♫</div>
      </div>

      {/* 漂浮的装饰元素 */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl"></div>
      <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-xl"></div>
    </div>
  );
}

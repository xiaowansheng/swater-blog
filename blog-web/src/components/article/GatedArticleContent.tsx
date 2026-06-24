'use client';

import { useState } from 'react';
import PasswordGate from './PasswordGate';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

interface GatedArticleContentProps {
  content: string | null;
  hasPassword: boolean;
  articleId: number;
}

export default function GatedArticleContent({ content, hasPassword, articleId }: GatedArticleContentProps) {
  const [unlockedContent, setUnlockedContent] = useState<string | null>(null);

  if (!hasPassword && content) {
    return <MarkdownRenderer content={content} enableImagePreview />;
  }

  if (!hasPassword && !content) {
    return null;
  }

  if (unlockedContent) {
    return <MarkdownRenderer content={unlockedContent} enableImagePreview />;
  }

  return (
    <PasswordGate
      articleId={articleId}
      onUnlock={(data) => setUnlockedContent(data.content)}
    />
  );
}

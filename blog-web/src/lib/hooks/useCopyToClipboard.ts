'use client';

import { useState, useCallback } from 'react';

interface UseCopyToClipboardProps {
  timeout?: number;
}

export function useCopyToClipboard({ timeout = 2000 }: UseCopyToClipboardProps = {}) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);

        setTimeout(() => {
          setIsCopied(false);
        }, timeout);
      } catch (error) {
        console.error('Failed to copy text:', error);
        setIsCopied(false);
      }
    },
    [timeout]
  );

  return { copyToClipboard, isCopied };
}

'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleTocProps {
  className?: string;
  onContentRendered?: boolean; // 新增：用于监听内容渲染完成
}

export default function ArticleToc({ className = '', onContentRendered }: ArticleTocProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  const generateToc = () => {
    // 获取文章内容中的所有标题 - 更新为 Vditor 渲染的内容
    const headings = document.querySelectorAll('.vditor-reset h1, .vditor-reset h2, .vditor-reset h3, .vditor-reset h4, .vditor-reset h5, .vditor-reset h6');
    const items: TocItem[] = [];

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || '';
      let id = heading.id;

      // 如果没有 id，生成一个
      if (!id) {
        id = `heading-${index}`;
        heading.id = id;
      }

      items.push({ id, text, level });
    });

    setTocItems(items);
  };

  useEffect(() => {
    // 延迟执行，确保 Vditor 渲染完成
    const timer = setTimeout(() => {
      generateToc();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 监听 Vditor 渲染完成事件
  useEffect(() => {
    const handleVditorRendered = () => {
      setTimeout(() => {
        generateToc();
      }, 100);
    };

    window.addEventListener('vditorRendered', handleVditorRendered);
    return () => window.removeEventListener('vditorRendered', handleVditorRendered);
  }, []);

  // 使用 MutationObserver 监听 DOM 变化
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const target = mutation.target as Element;
          if (target.classList.contains('vditor-reset') || target.closest('.vditor-reset')) {
            shouldUpdate = true;
          }
        }
      });
      
      if (shouldUpdate) {
        setTimeout(() => {
          generateToc();
        }, 100);
      }
    });

    const vditorContainer = document.querySelector('.vditor-reset');
    if (vditorContainer) {
      observer.observe(vditorContainer, {
        childList: true,
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    );

    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // 考虑固定头部的高度
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (tocItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <p className="text-sm">暂无目录</p>
      </div>
    );
  }

  return (
    <nav className={`space-y-1 ${className}`}>
      {tocItems.map(({ id, text, level }) => (
        <button
          key={id}
          onClick={() => scrollToHeading(id)}
          className={`
            block w-full text-left text-sm py-1.5 px-2 rounded transition-colors
            ${activeId === id 
              ? 'text-primary bg-primary/10 border-l-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }
          `}
          style={{ 
            paddingLeft: `${Math.max(level - 1, 0) * 12 + 8}px`,
            marginLeft: activeId === id ? '-2px' : '0'
          }}
          title={text}
        >
          <span className="truncate block">{text}</span>
        </button>
      ))}
    </nav>
  );
}
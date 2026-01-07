'use client';

import LoadingLink from './LoadingLink';
import { useSimpleRouteLoading } from '@/lib/hooks/useSimpleRouteLoading';

export default function LoadingTestLinks() {
  const { startLoading, isLoading } = useSimpleRouteLoading();

  const handleTestClick = () => {
    console.log('手动测试加载动画');
    startLoading();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-semibold mb-2 text-foreground">测试加载动画</h3>
      <div className="flex flex-col gap-2 text-xs">
        <LoadingLink href="/" className="text-primary hover:underline">
          首页
        </LoadingLink>
        <LoadingLink href="/about" className="text-primary hover:underline">
          关于页面
        </LoadingLink>
        <LoadingLink href="/archive" className="text-primary hover:underline">
          归档页面
        </LoadingLink>
        <button 
          onClick={handleTestClick}
          className="text-accent hover:underline text-left"
        >
          手动测试 {isLoading ? '(加载中...)' : ''}
        </button>
      </div>
    </div>
  );
}
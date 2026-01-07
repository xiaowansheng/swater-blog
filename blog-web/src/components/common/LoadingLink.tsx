'use client';

import React from 'react';
import Link from 'next/link';
import { useSimpleRouteLoading } from '@/lib/hooks/useSimpleRouteLoading';

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function LoadingLink({ href, children, className, onClick }: LoadingLinkProps) {
  const { startLoading } = useSimpleRouteLoading();

  const handleClick = () => {
    console.log('LoadingLink 点击:', href);
    startLoading();
    onClick?.();
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
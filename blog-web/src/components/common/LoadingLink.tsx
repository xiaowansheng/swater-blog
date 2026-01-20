'use client';

import React from 'react';
import Link from 'next/link';
import { useSimpleRouteLoading } from '@/lib/hooks/useSimpleRouteLoading';

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function LoadingLink({ href, children, className, onClick, style }: LoadingLinkProps) {
  const { startLoading } = useSimpleRouteLoading();

  const handleClick = () => {
    startLoading();
    onClick?.();
  };

  return (
    <Link href={href} className={className} onClick={handleClick} style={style}>
      {children}
    </Link>
  );
}
import { ReactNode } from 'react';
import { getFullUrl } from '@/lib/utils/format';

interface PageHeaderProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  coverImage?: string;
}

export default function PageHeader({ title, description, children, coverImage }: PageHeaderProps) {
  // 处理封面图片URL
  const fullCoverImage = coverImage ? getFullUrl(coverImage) : '';
  const sectionStyle = fullCoverImage ? {
    backgroundImage: `url(${fullCoverImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return (
    <section className="relative flex overflow-hidden justify-center items-center h-[40vh] max-h-[500px] min-h-[350px]" style={sectionStyle}>
      {/* 背景层：有封面图片时使用遮罩，无封面时使用渐变 */}
      {fullCoverImage ? (
        <div className="absolute inset-0 z-0 bg-black/40"></div>
      ) : (
        <>
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-b to-transparent pointer-events-none from-black/15 via-black/5 dark:from-black/30 dark:via-black/10"></div>
        </>
      )}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-primary/20"></div>
        <div className="absolute right-1/4 bottom-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-accent/20 [animation-delay:1s]"></div>
      </div>
      <div className="flex relative z-10 justify-center items-center px-4 w-full">
        <div className="mx-auto w-full max-w-4xl text-center">
          {children ? (
            children
          ) : (
            <>
              {title && <h1 className="mb-4 text-5xl font-bold gradient-text">{title}</h1>}
              {description && <p className="text-lg text-muted">{description}</p>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}


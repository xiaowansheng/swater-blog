import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Image from '@/components/common/ImageWithPreview';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MomentImages from '@/components/moment/MomentImages';
import { momentApi } from '@/lib/api/moment';
import { formatDate } from '@/lib/utils/format';
import { ISR_REVALIDATE } from '@/lib/constants';
import { getAuthorInfo } from '@/lib/api/config.server';

export const revalidate = ISR_REVALIDATE.HOME;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  try {
    const moment = await momentApi.getByKey(key);
    const content = moment.content.replace(/<[^>]*>/g, '').substring(0, 100);
    return {
      title: `说说 - ${content}...`,
      description: content,
    };
  } catch {
    return {
      title: '说说详情',
    };
  }
}

export default async function MomentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; key: string }>;
}) {
  const { key } = await params;
  const t = await getTranslations('common');

  try {
    const [moment, author] = await Promise.all([
      momentApi.getByKey(key),
      getAuthorInfo()
    ]);

    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 flex-1">
          <article className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-start gap-3 mb-6">
              {author.avatar && (
                <Image
                  src={author.avatar}
                  alt={author.name || '作者'}
                  width={48}
                  height={48}
                  className="rounded-full flex-shrink-0"
                  previewEnabled={false}
                />
              )}
              <div className="flex-1">
                <div className="text-lg font-medium mb-1">{author.name || '博主'}</div>
                <div className="text-xs text-muted-foreground/70">
                  {formatDate(moment.createTime)}
                </div>
              </div>
            </div>

            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: moment.content }}
            />

            {moment.images && moment.images.length > 0 && (
              <MomentImages
                images={moment.images}
                alt={moment.content.substring(0, 20)}
              />
            )}

            <div className="flex gap-6 items-center pt-6 mt-6 border-t border-border text-sm text-muted-foreground">
              <div className="flex gap-1 items-center">
                <span>❤️</span>
                <span>{moment.likeCount || 0}</span>
              </div>
              <div className="flex gap-1 items-center">
                <span>💬</span>
                <span>{moment.commentCount || 0}</span>
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load moment:', error);
    notFound();
  }
}


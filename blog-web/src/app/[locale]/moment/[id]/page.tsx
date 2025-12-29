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

export const revalidate = ISR_REVALIDATE.HOME;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const moment = await momentApi.getById(parseInt(id, 10));
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
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('common');

  try {
    const moment = await momentApi.getById(parseInt(id, 10));

    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 flex-1">
          <article className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm max-w-3xl mx-auto">
            <div className="flex gap-4 items-start mb-6">
              {moment.authorAvatar && (
                <Image
                  src={moment.authorAvatar}
                  alt={moment.authorName || '作者'}
                  width={64}
                  height={64}
                  className="rounded-full flex-shrink-0"
                  previewEnabled={false}
                />
              )}
              <div className="flex-1">
                <div className="flex gap-2 items-center mb-2">
                  <span className="text-lg font-medium">{moment.authorName || '博主'}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(moment.createTime)}
                  </span>
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


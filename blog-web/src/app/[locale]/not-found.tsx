import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/Card';
import { Link } from '@/lib/i18n/routing';

export default async function NotFound() {
  const t = await getTranslations('common');

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6" variant="glass">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold font-title text-primary/20 select-none">404</h1>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('notFoundTitle') || 'Page Not Found'}
          </h2>
        </div>
        
        <p className="text-muted-foreground">
          {t('notFoundDesc') || 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
        </p>

        <div className="pt-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1"
          >
            {t('backToHome') || 'Back to Home'}
          </Link>
        </div>
      </Card>
    </div>
  );
}

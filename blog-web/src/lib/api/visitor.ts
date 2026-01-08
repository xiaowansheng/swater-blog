import { fetchClient } from './client';
import type { ApiResponse } from '@/types';

export interface VisitorAccessPayload {
  visitorUuid?: string | null;
  pageType?: string;
  pageId?: string;
  pageUrl?: string;
  referer?: string;
  sessionId?: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

export interface VisitorAccessResult {
  visitorUuid: string;
  newVisitor: boolean;
  skipped: boolean;
}

export async function recordVisitorAccess(payload: VisitorAccessPayload): Promise<VisitorAccessResult> {
  return fetchClient<VisitorAccessResult>('/api/public/visitor/access', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

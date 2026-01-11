import { fetchClient } from './client';

export type ContentType = 'ARTICLE' | 'TALK';

export interface TrackEnterPayload {
  visitorUuid?: string | null;
  pageKey?: string;
  pageUrl?: string;
  referer?: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  contentType?: ContentType;
  contentId?: number;
}

export interface TrackEnterResult {
  visitorUuid: string;
  sessionId: string;
  newVisitor: boolean;
  newSession: boolean;
  pagePvCounted: boolean;
  contentReadCounted: boolean;
}

export async function trackEnter(payload: TrackEnterPayload): Promise<TrackEnterResult> {
  return fetchClient<TrackEnterResult>('/api/public/track/enter', {
    method: 'POST',
    body: JSON.stringify(payload),
    silent: true,
  });
}


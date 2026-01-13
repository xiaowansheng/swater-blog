import { fetchServer } from './server';

export interface TotalVisitsData {
  pv: number;
  uv: number;
}

/**
 * 获取网站总访问量（用于服务端组件）
 */
export async function getTotalVisits(): Promise<TotalVisitsData> {
  try {
    return await fetchServer<TotalVisitsData>('/api/public/statistics/total');
  } catch (error) {
    console.warn('Failed to load total visits:', error);
    return { pv: 0, uv: 0 };
  }
}

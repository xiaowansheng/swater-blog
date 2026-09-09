import type { ApiResponse } from '@/types';
import { getMockResponse } from './mock';
import { normalizeApiUrl } from '@/lib/utils/apiUrl';

const CLIENT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : '/');
const SERVER_BASE_URL = process.env.SERVER_API_BASE_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : 'http://127.0.0.1:8888');

const API_BASE_URL = SERVER_BASE_URL || CLIENT_BASE_URL;

type NextFetchOptions = {
  tags?: string[];
  revalidate?: number;
};

const DEFAULT_SERVER_TIMEOUT = 15000;

export type FetchServerOptions = Omit<RequestInit, 'signal'> & {
  next?: NextFetchOptions;
  signal?: AbortSignal;
  timeout?: number;
};

export async function fetchServer<T>(url: string, options?: FetchServerOptions): Promise<T> {
  const mockData = getMockResponse<T>(url, options);
  if (mockData !== null) {
    return mockData;
  }

  const timeout = options?.timeout ?? DEFAULT_SERVER_TIMEOUT;
  const controller = new AbortController();
  const externalSignal = options?.signal;
  let timedOut = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const abortFromExternalSignal = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      // 调用方传入已 abort 的 signal：立即中止，不发起请求（与超时 abort 对称）
      controller.abort();
      throw new Error('请求已被取消');
    } else {
      externalSignal.addEventListener('abort', abortFromExternalSignal, { once: true });
    }
  }
  if (timeout > 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);
  }

  const requestOptions = { ...options };
  delete requestOptions.signal;
  delete requestOptions.timeout;

  try {
    const response = await fetch(normalizeApiUrl(API_BASE_URL, url), {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...(process.env.NODE_ENV === 'development' ? { cache: 'no-store' } : {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (result.code !== 200) {
      throw new Error(result.message || 'Request failed');
    }

    return result.data;
  } catch (error: unknown) {
    if (timedOut) {
      throw new Error('服务端请求超时，请稍后重试');
    }
    // 外部调用方主动取消（options.signal.abort）：归类为取消，而非网络错误
    if (externalSignal?.aborted) {
      throw new Error('请求已被取消');
    }
    const err = error as { code?: string; message?: string };
    if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      console.warn(`API server connection failed: ${normalizeApiUrl(API_BASE_URL, url)}`);
      throw error;
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    externalSignal?.removeEventListener('abort', abortFromExternalSignal);
  }
}


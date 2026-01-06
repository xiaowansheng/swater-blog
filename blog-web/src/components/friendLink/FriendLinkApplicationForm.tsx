'use client';

import { useState } from 'react';
import { friendLinkApi } from '@/lib/api/friendLink';
import type { FriendLinkApplicationDTO } from '@/types';

interface FriendLinkApplicationFormProps {
  onSuccess?: () => void;
}

export default function FriendLinkApplicationForm({
  onSuccess,
}: FriendLinkApplicationFormProps) {
  const [formData, setFormData] = useState<FriendLinkApplicationDTO>({
    name: '',
    author: '',
    url: '',
    logo: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.author.trim() || !formData.url.trim()) {
      setError('请填写必填项（网站名称、您的昵称、网站地址）');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await friendLinkApi.apply({
        name: formData.name.trim(),
        author: formData.author.trim(),
        url: formData.url.trim(),
        logo: formData.logo?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      });
      setSuccess(true);
      setFormData({
        name: '',
        author: '',
        url: '',
        logo: '',
        description: '',
      });
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || '提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-5 pr-2">
        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-800 rounded-xl shadow-sm">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-800 rounded-xl shadow-sm">
            <p className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              申请提交成功！我们会在审核通过后联系您
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            网站名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入网站名称"
            required
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            您的昵称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            placeholder="请输入您的昵称"
            required
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            网站地址 <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com"
            required
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            网站Logo
          </label>
          <input
            type="url"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            placeholder="https://example.com/logo.png"
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            网站描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="请简单描述您的网站"
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none shadow-sm focus:shadow-md"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-border mt-5">
        <button
          type="submit"
          disabled={loading || success}
          className="w-full px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 transition-all font-medium relative overflow-hidden group"
        >
          {loading ? '提交中...' : success ? '已提交' : '提交申请'}
        </button>
      </div>
    </form>
  );
}

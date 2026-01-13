import type { AuthorInfo } from '@/types';
import { getFullUrl } from '@/lib/utils/format';

interface AuthorCardProps {
  author: AuthorInfo;
}

export default function AuthorCard({ author }: AuthorCardProps) {
  const {
    name,
    avatar,
    signature,
    introduction,
    email,
    qq,
    wechat,
    github,
    gitee,
    weibo,
    zhihu,
    bilibili,
    twitter,
    telegram,
    facebook,
    youtube,
  } = author;

  // 联系方式配置
  const contactLinks = [
    { name: '邮箱', key: 'email', value: email, href: email ? `mailto:${email}` : undefined, color: 'from-red-400 to-pink-500' },
    { name: 'QQ', key: 'qq', value: qq, href: qq ? `tencent://message/?uin=${qq}` : undefined, color: 'from-blue-400 to-cyan-500' },
    { name: '微信', key: 'wechat', value: wechat, color: 'from-green-400 to-emerald-500' },
  ];

  // 社交链接配置
  const socialLinks = [
    {
      name: 'GitHub',
      url: github,
      color: 'text-gray-800 dark:text-gray-200 hover:bg-gray-800 hover:text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Gitee',
      url: gitee,
      color: 'text-red-500 hover:bg-red-500 hover:text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.037a.594.594 0 0 1-.592-.593v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z" />
        </svg>
      ),
    },
    {
      name: '微博',
      url: weibo,
      color: 'text-orange-500 hover:bg-orange-500 hover:text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10.098 20c-4.27 0-7.827-2.344-7.827-5.42 0-1.695.997-3.236 2.59-4.275-.127-.38-.22-.777-.22-1.195 0-2.421 2.47-4.384 5.516-4.384 3.046 0 5.517 1.963 5.517 4.384 0 .897-.326 1.73-.887 2.436 1.34.996 2.18 2.373 2.18 3.904 0 3.076-3.558 5.42-7.828 5.42-.355 0-.704-.017-1.046-.05h-.001c.313-.29.5-.697.5-1.143 0-.878-.726-1.59-1.622-1.59-.376 0-.722.125-.998.336.093-.404.148-.825.148-1.26 0-2.535-2.232-4.59-4.986-4.59-.273 0-.54.024-.802.067 1.27-1.075 3.07-1.752 5.08-1.752 3.823 0 6.923 2.385 6.923 5.327 0 2.943-3.1 5.328-6.923 5.328-.577 0-1.137-.06-1.673-.17.998-.49 1.686-1.492 1.686-2.658 0-1.645-1.383-2.978-3.088-2.978-.416 0-.813.08-1.175.226.375-.633.958-1.16 1.668-1.506 2.057-.998 4.665-.276 5.822 1.614.692 1.138.663 2.483-.008 3.594z" />
        </svg>
      ),
    },
    {
      name: '知乎',
      url: zhihu,
      color: 'text-blue-600 hover:bg-blue-600 hover:text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0zm1.964 4.078h6.158c.618 0 .838.394.838.78v8.46c0 .39-.22.78-.838.78h-6.158c-.618 0-.838-.39-.838-.78V4.858c0-.386.22-.78.838-.78zm8.15 1.407h.838c.618 0 .838.394.838.78v6.158c0 .39-.22.78-.838.78h-.838c-.618 0-.838-.39-.838-.78V6.265c0-.386.22-.78.838-.78z" />
        </svg>
      ),
    },
    {
      name: 'Bilibili',
      url: bilibili,
      color: 'text-pink-500 hover:bg-pink-500 hover:text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      url: twitter,
      color: 'text-black dark:text-white hover:bg-black hover:text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      url: telegram,
      color: 'text-sky-500 hover:bg-sky-500 hover:text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      url: facebook,
      color: 'text-blue-600 hover:bg-blue-700 hover:text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      url: youtube,
      color: 'text-red-600 hover:bg-red-600 hover:text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  const availableSocialLinks = socialLinks.filter(link => link.url);
  const availableContactLinks = contactLinks.filter(link => link.value);

  return (
    <div className="relative overflow-hidden group">
      {/* 二次元风格背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-purple-100/30 to-blue-100/50 dark:from-pink-900/20 dark:via-purple-900/10 dark:to-blue-900/20" />
      
      {/* 浮动装饰元素 */}
      <div className="absolute top-4 right-4 w-16 h-16 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-pink-400 animate-pulse">
          <path d="M50 15 L61 40 L88 40 L67 55 L76 82 L50 67 L24 82 L33 55 L12 40 L39 40 Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="absolute bottom-8 left-8 w-12 h-12 opacity-15">
        <svg viewBox="0 0 100 100" className="w-full h-full text-purple-400 animate-bounce" style={{ animationDuration: '3s' }}>
          <circle cx="50" cy="50" r="40" fill="currentColor"/>
        </svg>
      </div>
      <div className="absolute top-1/2 right-8 w-8 h-8 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full text-blue-400 animate-spin" style={{ animationDuration: '8s' }}>
          <polygon points="50,5 95,50 50,95 5,50" fill="currentColor"/>
        </svg>
      </div>

      {/* 主卡片 */}
      <div className="relative bg-card/80 backdrop-blur-sm border-2 border-pink-200/50 dark:border-pink-800/30 rounded-3xl p-6 md:p-8 shadow-xl shadow-pink-100/50 dark:shadow-pink-900/20 mb-8">
        
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full" />
        
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          
          {/* 头像区域 - 二次元风格 */}
          <div className="relative flex-shrink-0">
            {/* 头像光环效果 */}
            <div className="absolute -inset-3 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full opacity-50 blur-lg transition-all duration-500 group-hover:opacity-100 group-hover:scale-110" />
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-full transition-all duration-300 group-hover:animate-spin-slow" style={{ animationDuration: '8s' }} />
            
            {/* 头像容器 */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl">
              {avatar ? (
                <img
                  src={getFullUrl(avatar)}
                  alt={name || '作者头像'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800 flex items-center justify-center">
                  <span className="text-4xl">🎨</span>
                </div>
              )}
            </div>

            {/* 在线状态指示器 */}
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-3 border-white dark:border-gray-800 animate-pulse shadow-lg shadow-green-400/50" />
          </div>

          {/* 信息区域 */}
          <div className="flex-1 text-center lg:text-left space-y-4">
            
            {/* 昵称 - 带装饰 */}
            <div className="relative inline-block">
              {name && (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                    {name}
                  </h2>
                  {/* 名字下方装饰线 */}
                  <div className="mt-2 h-1 w-full bg-gradient-to-r from-pink-400/0 via-purple-400 to-blue-400/0 rounded-full" />
                </>
              )}
            </div>

            {/* 个性签名 - 气泡样式 */}
            {signature && (
              <div className="relative inline-block max-w-md">
                <div className="relative bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 rounded-2xl px-5 py-3 border border-pink-200/50 dark:border-pink-700/30">
                  {/* 气泡尖角 */}
                  <div className="absolute -left-2 top-4 w-4 h-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 border-l border-b border-pink-200/50 dark:border-pink-700/30 transform rotate-45 hidden lg:block" />
                  <p className="text-base md:text-lg text-purple-600 dark:text-purple-300 italic font-medium">
                    ✨ {signature} ✨
                  </p>
                </div>
              </div>
            )}

            {/* 简介 */}
            {introduction && (
              <div className="relative">
                <p className="text-sm md:text-base text-foreground/70 leading-relaxed max-w-2xl">
                  {introduction}
                </p>
              </div>
            )}

            {/* 联系方式标签 */}
            {availableContactLinks.length > 0 && (
              <div className="pt-2">
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  {availableContactLinks.map(contact => (
                    contact.href ? (
                      <a
                        key={contact.key}
                        href={contact.href}
                        className={`group/contact relative px-4 py-2 rounded-full bg-gradient-to-r ${contact.color} text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
                      >
                        <span className="flex items-center gap-2">
                          {contact.name === '邮箱' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                          {contact.name === 'QQ' && <span>🐧</span>}
                          {contact.value}
                        </span>
                      </a>
                    ) : (
                      <div
                        key={contact.key}
                        className={`relative px-4 py-2 rounded-full bg-gradient-to-r ${contact.color} text-white text-sm font-medium shadow-lg cursor-default`}
                        title={contact.name === '微信' ? '微信号' : contact.name}
                      >
                        <span className="flex items-center gap-2">
                          {contact.name === '微信' && <span>💬</span>}
                          {contact.value}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* 社交链接 - 二次元风格按钮 */}
            {availableSocialLinks.length > 0 && (
              <div className="pt-4">
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  {availableSocialLinks.map(link => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group/social relative p-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${link.color}`}
                      title={link.name}
                    >
                      {/* 悬停光效 */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/0 via-purple-400/20 to-blue-400/0 opacity-0 group-hover/social:opacity-100 transition-opacity duration-300" />
                      <span className="relative">{link.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400/0 via-purple-400/50 to-blue-400/0" />
      </div>

      {/* 添加自定义动画样式 */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

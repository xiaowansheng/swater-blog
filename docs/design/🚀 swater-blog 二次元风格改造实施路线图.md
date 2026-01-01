🗓️ 阶段一：基础设施与设计语言注入 (Infrastructure & Design Tokens)
目标：建立设计规范的代码映射，不改变现有布局结构，仅替换底层变量。

1.1 设计令牌 (Design Tokens) 落地
将规范中的颜色与动画变量注入 CSS 根作用域。

行动点：

创建 styles/theme.css 或更新 globals.css。

定义 :root (Light) 和 .dark (Dark) 的 CSS 变量。

关键映射：确保 --primary 准确映射为薄荷绿 (#34d399)。

1.2 配置原子化 CSS (Tailwind CSS)
将语义化 Token 扩展到 Tailwind 配置中，以便开发时直接使用。

行动点：修改 tailwind.config.js。

JavaScript

// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 语义化映射
        primary: 'var(--primary)',
        card: 'var(--card)',
        'deco-pink': 'var(--deco-pink)',
        'deco-yellow': 'var(--deco-yellow)',
      },
      borderRadius: {
        '3xl': '1.5rem', // 二次元风格的大圆角
      },
      animation: {
        'float': 'float 6s ease-in-out infinite', // 呼吸动画
        'twinkle': 'twinkle 2s ease-in-out infinite', // 闪烁
      }
    }
  }
}
1.3 字体与排版微调
引入圆体或更柔和的无衬线字体，奠定“可爱/清新”的基调。

行动点：引入 Nunito (英) + Varela Round (圆体替代) 或 Noto Sans SC (设置较小字重)。

🗓️ 阶段二：核心视觉重构 (Core Visual Refactoring)
目标：彻底改变 UI 形态，实现“薄荷绿 + 圆角 + 卡片化”的核心视觉风格。

2.1 全局背景改造
行动点：

移除原有的灰/白背景。

应用 --background (#f0fdf4)。

添加 CSS Pattern（如 10% 透明度的波点或方格），作为静态纹理层。

2.2 文章卡片 (Article Card) —— 关键战役
这是用户视觉焦点，必须严格按照“3.3”节执行。

行动点：

容器：应用 bg-card + rounded-3xl + border-mint-200。

交互：添加 hover:translate-y-[-4px] 和 hover:shadow-mint。

装饰：在卡片右上角通过 ::after 伪元素添加简单的“书签”或“折角”效果。

2.3 导航栏与 Footer
行动点：

导航栏：实现 backdrop-blur-md (毛玻璃)，链接 hover 时增加“小星星”图标或下划线动画。

Footer：增加 CuteDivider (波浪线 SVG) 作为与正文的分割。

🗓️ 阶段三：装饰系统与图层架构 (Decoration System)
目标：注入二次元“灵魂”，但通过严格的图层管理（Z-Index）确保不干扰内容阅读。

为了直观理解如何放置装饰物而不遮挡内容，请参考下方的图层架构设计：

3.1 装饰组件开发
创建独立的 components/decoration 目录：

<SakuraRain />：基于 Canvas 的樱花飘落（需实现对象池以优化性能）。

<Mascot />：看板娘容器（初期可用静态图 + CSS 动画）。

<CornerDecoration />：用于标题或卡片的局部装饰。

3.2 布局分层 (Layout Layering)
严格控制 z-index，防止“樱花挡住文字”的惨剧：

z-0: Canvas 动态背景 (pointer-events-none)

z-10: 静态背景纹理

z-20: 主要内容卡片 (必须设置背景色，不可透明)

z-30: 导航栏 / 侧边栏

z-40: 看板娘 (右下角固定)

z-50: Modal / Toast

🗓️ 阶段四：看板娘与交互逻辑 (Mascot & Interaction)
目标：建立用户与博客的“情感连接”，不仅仅是放置图片。

4.1 状态机 Hook (useMascotSystem)
实现规范中的 MascotEvent 逻辑。

Scroll 监听：滚动 > 80% 触发 long_read 事件（提示“辛苦了”）。

Time 监听：进入页面判断时间，触发 night 或 morning 问候。

Route 监听：路由切换时触发 page_enter。

4.2 交互反馈微动画
点击反馈：为“点赞”按钮添加粒子爆炸效果 (Confetti)。

页面切换：实现柔和的淡入淡出 (Framer Motion 或 CSS View Transitions)。

🗓️ 阶段五：控制中心与性能打磨 (Controls & Polish)
目标：将控制权交还给用户，确保高性能体验。

5.1 全局配置 Store
建立 useThemeStore (Zustand/Pinia) 管理装饰开关：

decorationLevel: 'none' (无) | 'low' (仅静态) | 'high' (全特效)

mascotVisible: boolean

5.2 移动端适配检查 (Mobile Audit)
Media Query：在 < 768px 时，强制 display: none 隐藏 Canvas 粒子和看板娘，仅保留 CSS 样式。

Touch Target：确保圆角按钮在手机上易于点击。
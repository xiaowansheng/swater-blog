# 二次元评论组件

一个可爱的二次元风格评论组件，支持表情包、图片上传、嵌套回复等功能。

## 功能特性

✨ **二次元风格设计**
- 可爱的二次元头像系统（自动根据昵称生成）
- 粉紫色系渐变背景
- 装饰性元素（✿、✦等）
- 流畅的动画效果

🎨 **丰富的交互功能**
- 颜文字表情包选择器（开心、难过、惊讶、害羞等多种分类）
- 图片上传支持（最多3张，支持预览和删除）
- 嵌套回复（支持最多3层嵌套）
- 评论展开/收起功能

💾 **用户体验优化**
- 自动保存用户信息（昵称、邮箱）
- 智能表单验证
- 响应式设计（PC和移动端适配）
- 加载动画和空状态提示

🔧 **灵活的配置**
- 支持文章评论和动态评论
- 根据后台配置动态调整功能
- 匿名评论/游客评论控制
- 评论审核开关

## 使用方法

### 基础用法

```tsx
import { AnimeComment } from '@/components/anime-comment';

// 文章详情页
<AnimeComment postId={article.id} />

// 动态详情页
<AnimeComment momentId={moment.id} />
```

### 高级配置

```tsx
<AnimeComment
  postId={article.id}
  config={{
    allowAnonymous: true,    // 允许匿名评论
    allowGuest: true,         // 允许游客评论
    enableAudit: false,       // 是否启用审核
    showEmail: false,         // 是否显示邮箱字段
    allowImage: true,         // 是否允许上传图片
    maxImages: 3,             // 最大图片数量
    maxImageSize: 5,          // 最大图片大小（MB）
  }}
  showTitle={true}            // 是否显示标题
  className="mt-8"           // 自定义class名
/>
```

## 组件结构

```
anime-comment/
├── AnimeComment.tsx        # 容器组件（数据获取和状态管理）
├── AnimeCommentForm.tsx    # 评论表单组件
├── AnimeCommentList.tsx    # 评论列表组件
├── AnimeCommentItem.tsx    # 单个评论项组件
├── EmojiPicker.tsx         # 表情包选择器
├── types.ts                # TypeScript类型定义
├── constants.ts            # 常量（头像、表情包等）
├── animations.css          # 动画样式
└── index.ts                # 导出文件
```

## 样式定制

组件使用了Tailwind CSS，主要颜色变量：

- 主色：`from-pink-400 to-purple-400`
- 背景色：`from-pink-50/80 to-purple-50/80`
- 边框色：`border-pink-200`

可以通过修改 `constants.ts` 中的颜色类来自定义样式。

## 表情包列表

默认包含以下分类的颜文字：
- 开心 (8个)
- 难过 (5个)
- 惊讶 (6个)
- 害羞 (5个)
- 生气 (5个)
- 疑问 (5个)
- 其他 (8个)

可在 `constants.ts` 中的 `KAOMOJI_EMOJIS` 数组中添加更多表情。

## 二次元头像

使用了 DiceBear API 提供的动漫风格头像：
- avataaars：卡通头像
- adventurer：冒险者风格
- notionists：极简风格
- big-smile：笑脸风格

头像根据用户昵称自动生成，确保相同昵称获得相同头像。

## 国际化

支持中英文双语，翻译文件位于 `messages/zh.json` 和 `messages/en.json`。

添加新的翻译：
```json
"comment": {
  "yourKey": "你的翻译文本"
}
```

## 注意事项

1. **图片上传**：目前仅支持前端预览，需要后端API配合实现实际的图片上传功能
2. **评论配置**：建议从后台API获取配置，前端使用默认配置作为fallback
3. **性能优化**：大量评论时建议添加分页功能
4. **安全性**：评论内容需要后端进行XSS过滤和敏感词过滤

## 后续优化计划

- [ ] 支持评论点赞功能
- [ ] 支持评论排序（时间/热度）
- [ ] 支持评论搜索
- [ ] 支持 Markdown 渲染
- [ ] 支持 @提醒功能
- [ ] 支持评论编辑和删除
- [ ] 添加评论分页
- [ ] 优化大量评论的渲染性能

## 技术栈

- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- next-intl（国际化）

## License

MIT

interface Template {
  key: string
  label: string
  icon: string
  description: string
  template: string
}

const templates: Template[] = [
  {
    key: 'info',
    label: '信息提示框',
    icon: 'ℹ️',
    description: '蓝色信息提示',
    template: '> **ℹ️ 提示**\n> \n> 这是一条提示信息。\n',
  },
  {
    key: 'warning',
    label: '警告提示框',
    icon: '⚠️',
    description: '黄色警告提示',
    template: '> **⚠️ 警告**\n> \n> 请注意：这是一条警告信息。\n',
  },
  {
    key: 'danger',
    label: '危险提示框',
    icon: '🚫',
    description: '红色危险提示',
    template: '> **🚫 危险**\n> \n> 这是一条危险警告！\n',
  },
  {
    key: 'success',
    label: '成功提示框',
    icon: '✅',
    description: '绿色成功提示',
    template: '> **✅ 成功**\n> \n> 操作已成功完成。\n',
  },
  {
    key: 'code',
    label: '代码块',
    icon: '💻',
    description: '带语言的代码块',
    template: '```language\n// 在此处编写代码\n```\n',
  },
  {
    key: 'table',
    label: '表格',
    icon: '📊',
    description: '3×3 表格模板',
    template: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n| 内容 | 内容 | 内容 |\n| 内容 | 内容 | 内容 |\n',
  },
  {
    key: 'collapse',
    label: '折叠块',
    icon: '📋',
    description: '可折叠的详情块',
    template: '??? note "点击展开"\n    这里是隐藏的详细内容，支持 **Markdown** 语法。\n\n    - 列表项 1\n    - 列表项 2\n',
  },
  {
    key: 'quote',
    label: '引用块',
    icon: '💬',
    description: '多层引用',
    template: '> 这是一段引用文字\n>\n> > 这是嵌套引用\n>\n> 回到第一层引用\n',
  },
  {
    key: 'toc',
    label: '文章目录',
    icon: '📑',
    description: '目录占位（自动生成）',
    template: '[TOC]\n\n---\n',
  },
  {
    key: 'divider',
    label: '分隔线',
    icon: '➖',
    description: '带标题的分隔线',
    template: '---\n\n## 下一章节\n\n',
  },
  {
    key: 'task',
    label: '任务列表',
    icon: '☑️',
    description: '可勾选的任务列表',
    template: '- [ ] 待办事项 1\n- [ ] 待办事项 2\n- [x] 已完成事项\n- [ ] 待办事项 3\n',
  },
  {
    key: 'ending',
    label: '文章结尾',
    icon: '✍️',
    description: '统一的文章收尾',
    template: '---\n\n*感谢阅读！如果本文对你有帮助，欢迎点赞、收藏、分享。*\n\n*如有疑问或建议，请在评论区留言交流。*\n',
  },
]

export { templates }
export type { Template }

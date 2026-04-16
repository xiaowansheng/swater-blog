# 博客前端 (blog-web)

基于 Next.js + React 的博客前端，提供多语言、主题样式、文章阅读与互动体验。

## 技术栈

- Next.js 16
- React 19
- Tailwind CSS
- next-intl
- Zustand

## 开发

```bash
# 安装依赖
npm install
# 或
pnpm install

# 启动开发服务器
npm run dev
# 或
pnpm dev
```

默认开发端口：`http://localhost:3001`

## 环境配置

复制 `.env.example` 为 `.env.local` 可覆盖默认值。

主要配置项：
- `NEXT_PUBLIC_API_BASE_URL` - 浏览器侧 API 基础地址
- `SERVER_API_BASE_URL` - SSR/Server Components 访问后端的地址
- `REVALIDATE_TOKEN` - `/api/revalidate` 的服务端令牌

## 生产构建

```bash
npm run build
npm run start
```

## 相关文档

- [加载动画优化](./docs/加载动画优化.md)

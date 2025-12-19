export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware 已经处理了重定向，这里不需要再次重定向
  // 如果 children 存在，说明已经在正确的路由上了
  return children;
}

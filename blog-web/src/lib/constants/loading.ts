/**
 * 加载动画配置常量
 * 
 * 设计原则：
 * - 加载完成就关闭，不强制等待
 * - 保留最小时长防止闪烁
 * - 支持并发安全
 */

export const LOADING_CONFIG = {
  /**
   * 路由切换加载的最小持续时间（毫秒）
   * 防止极快切换时的闪烁，建议 200-300ms
   */
  ROUTE_MIN_DURATION: 250,

  /**
   * 首屏加载的最小持续时间（毫秒）
   * 保留品牌开场效果，建议 700-1000ms
   */
  INITIAL_MIN_DURATION: 800,

  /**
   * 首屏品牌动画时长（毫秒）
   * 完整的开场动画时长
   */
  INITIAL_BRAND_ANIMATION: 3000,

  /**
   * 加载显示阈值（毫秒）
   * 如果加载时间低于此值，不显示 loading（可选优化）
   */
  SHOW_THRESHOLD: 100,

  /**
   * 进度条模拟增长速度（毫秒）
   */
  PROGRESS_INTERVAL: 100,

  /**
   * 进度条最大值（等待真实完成）
   */
  PROGRESS_MAX_BEFORE_COMPLETE: 90,
} as const;

export type LoadingConfig = typeof LOADING_CONFIG;

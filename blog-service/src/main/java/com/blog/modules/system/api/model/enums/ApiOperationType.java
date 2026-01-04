package com.blog.modules.system.api.model.enums;

/**
 * 接口操作类型（供注解使用）
 * 注意：该枚举定义在 common 层，避免对 domain 层产生反向依赖。
 * 具体持久化仍由应用层将字符串映射为领域枚举（名称需保持一致）。
 */
public enum ApiOperationType {
    CREATE,     // 新增
    UPDATE,     // 更新
    DELETE,     // 删除
    QUERY,      // 查询
    LOGIN,      // 登录
    LOGOUT,     // 登出
    IMPORT,     // 导入
    EXPORT,     // 导出
    ENABLE,     // 启用
    DISABLE,    // 停用
    PUBLISH,    // 发布
    UNPUBLISH,  // 下线
    OTHER       // 其他
}


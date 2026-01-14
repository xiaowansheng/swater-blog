package com.blog.modules.system.api.model.vo;


import lombok.Data;

/**
 * API刷新结果
 */
@Data
public class ApiRefreshResultVO {

    /**
     * 创建的模块数量
     */
    private Integer createdModules;

    /**
     * 更新的模块数量
     */
    private Integer updatedModules;

    /**
     * 创建的接口数量
     */
    private Integer createdApis;

    /**
     * 更新的接口数量
     */
    private Integer updatedApis;

    /**
     * 总处理数量
     */
    private Integer total;

    /**
     * 执行时间（毫秒）
     */
    private Long executionTime;

    /**
     * 操作消息
     */
    private String message;

    public ApiRefreshResultVO() {
    }

    public ApiRefreshResultVO(Integer createdModules, Integer updatedModules,
                              Integer createdApis, Integer updatedApis,
                              Long executionTime) {
        this.createdModules = createdModules;
        this.updatedModules = updatedModules;
        this.createdApis = createdApis;
        this.updatedApis = updatedApis;
        this.total = createdModules + updatedModules + createdApis + updatedApis;
        this.executionTime = executionTime;
        this.message = buildMessage();
    }

    private String buildMessage() {
        StringBuilder sb = new StringBuilder();
        sb.append("接口刷新完成。");

        if (createdModules > 0) {
            sb.append(String.format("新增模块 %d 个", createdModules));
        }
        if (updatedModules > 0) {
            if (sb.length() > 6) sb.append("，");
            sb.append(String.format("更新模块 %d 个", updatedModules));
        }
        if (createdApis > 0) {
            if (sb.length() > 6) sb.append("，");
            sb.append(String.format("新增接口 %d 个", createdApis));
        }
        if (updatedApis > 0) {
            if (sb.length() > 6) sb.append("，");
            sb.append(String.format("更新接口 %d 个", updatedApis));
        }

        sb.append(String.format("，总计处理 %d 项，耗时 %d ms", total, executionTime));
        return sb.toString();
    }
}

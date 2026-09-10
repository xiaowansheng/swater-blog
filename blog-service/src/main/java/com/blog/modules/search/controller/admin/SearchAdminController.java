package com.blog.modules.search.controller.admin;

import com.blog.modules.search.service.SearchSyncService;
import com.blog.shared.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.shared.annotation.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 搜索索引管理接口。
 * <p>
 * ES 同步是事件驱动的（失败仅记日志），长期运行后索引可能与库内数据漂移；
 * 此处提供全量对账入口，供管理员在漂移后手工重建索引。
 * 仅在 plugin.search.active=elasticsearch 时装配，database 模式无此端点。
 * </p>
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/search")
@ApiOperation(name = "搜索管理模块", description = "搜索索引管理接口", open = false)
@ConditionalOnProperty(name = "plugin.search.active", havingValue = "elasticsearch")
public class SearchAdminController {

    @Autowired
    private SearchSyncService searchSyncService;

    @PostMapping("/reindex")
    @ApiOperation(name = "全量重建搜索索引", type = ApiOperationType.OTHER, description = "全量对账：将库内已发布的文章/说说/评论重建到搜索索引")
    public Result<String> reindexAll() {
        log.info("管理员触发搜索索引全量重建");
        searchSyncService.syncAllPosts();
        searchSyncService.syncAllMoments();
        searchSyncService.syncAllComments();
        return Result.success("搜索索引全量重建完成");
    }
}

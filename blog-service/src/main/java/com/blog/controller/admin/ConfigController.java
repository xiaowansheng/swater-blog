package com.blog.controller.admin;

import com.blog.annotation.ApiOperation;
import com.blog.model.enums.ApiOperationType;
import com.blog.common.Result;
import com.blog.model.dto.ConfigDTO;
import com.blog.model.vo.ConfigVO;
import com.blog.service.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/config")
@ApiOperation(name = "配置管理模块", description = "配置管理接口", open = false)
public class ConfigController {
    @Autowired
    private ConfigService configService;

    @GetMapping("/list")
    @ApiOperation(name = "查询配置列表", type = ApiOperationType.QUERY, description = "按组查询配置列表")
    public Result<List<ConfigVO>> list(@RequestParam(required = false) String groupName) {
        List<ConfigVO> configs = configService.list(groupName);
        return Result.success(configs);
    }

    @GetMapping("/groups")
    @ApiOperation(name = "获取配置组", type = ApiOperationType.QUERY, description = "获取所有配置组")
    public Result<List<String>> getGroups() {
        List<String> groups = configService.getGroups();
        return Result.success(groups);
    }

    @GetMapping("/{key}")
    @ApiOperation(name = "获取配置详情", type = ApiOperationType.QUERY, description = "根据key获取配置")
    public Result<ConfigVO> getByKey(@PathVariable String key) {
        ConfigVO vo = configService.getByKey(key);
        if (vo == null) {
            return Result.error(404, "配置不存在");
        }
        return Result.success(vo);
    }

    @PutMapping("/{key}")
    @ApiOperation(name = "更新配置", type = ApiOperationType.UPDATE, description = "根据key更新配置")
    public Result<ConfigVO> updateByKey(@PathVariable String key, @RequestBody ConfigDTO configDTO) {
        ConfigVO vo = configService.updateByKey(key, configDTO);
        return Result.success(vo);
    }

    @PutMapping("/batch")
    @ApiOperation(name = "批量更新配置", type = ApiOperationType.UPDATE, description = "批量更新配置")
    public Result<Void> updateBatch(@RequestBody Map<String, Object> configs) {
        configService.updateBatch(configs);
        return Result.success();
    }
}

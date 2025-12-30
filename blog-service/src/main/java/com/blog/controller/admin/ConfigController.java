package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
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
@ApiResource(name = "配置管理接口")
public class ConfigController {
    @Autowired
    private ConfigService configService;

    @GetMapping("/list")
    public Result<List<ConfigVO>> list(@RequestParam(required = false) String groupName) {
        List<ConfigVO> configs = configService.list(groupName);
        return Result.success(configs);
    }

    @GetMapping("/groups")
    public Result<List<String>> getGroups() {
        List<String> groups = configService.getGroups();
        return Result.success(groups);
    }

    @GetMapping("/{key}")
    public Result<ConfigVO> getByKey(@PathVariable String key) {
        ConfigVO vo = configService.getByKey(key);
        if (vo == null) {
            return Result.error(404, "配置不存在");
        }
        return Result.success(vo);
    }

    @PutMapping("/{key}")
    public Result<ConfigVO> updateByKey(@PathVariable String key, @RequestBody ConfigDTO configDTO) {
        ConfigVO vo = configService.updateByKey(key, configDTO);
        return Result.success(vo);
    }

    @PutMapping("/batch")
    public Result<Void> updateBatch(@RequestBody Map<String, Object> configs) {
        configService.updateBatch(configs);
        return Result.success();
    }
}


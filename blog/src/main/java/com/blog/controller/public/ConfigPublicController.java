package com.blog.controller.public;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.vo.ConfigVO;
import com.blog.service.ConfigPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/config")
@ApiResource(name = "配置公开接口", isOpen = true)
public class ConfigPublicController {
    @Autowired
    private ConfigPublicService configPublicService;

    @GetMapping("/{key}")
    public Result<ConfigVO> getByKey(@PathVariable String key) {
        ConfigVO vo = configPublicService.getByKey(key);
        if (vo == null) {
            return Result.error(404, "配置不存在");
        }
        return Result.success(vo);
    }

    @GetMapping("/group/{groupName}")
    public Result<Map<String, Object>> getByGroup(@PathVariable String groupName) {
        Map<String, Object> configs = configPublicService.getByGroup(groupName);
        return Result.success(configs);
    }
}


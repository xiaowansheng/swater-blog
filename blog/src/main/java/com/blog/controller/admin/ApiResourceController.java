package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.dto.ApiResourceDTO;
import com.blog.model.vo.ApiResourceVO;
import com.blog.service.ApiResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/api-resource")
@ApiResource(name = "接口资源管理接口")
public class ApiResourceController {
    @Autowired
    private ApiResourceService apiResourceService;

    @GetMapping("/list")
    public Result<List<ApiResourceVO>> list() {
        List<ApiResourceVO> list = apiResourceService.list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<ApiResourceVO> getById(@PathVariable Long id) {
        ApiResourceVO vo = apiResourceService.getById(id);
        if (vo == null) {
            return Result.error(404, "接口资源不存在");
        }
        return Result.success(vo);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ApiResourceDTO dto) {
        apiResourceService.update(id, dto);
        return Result.success();
    }

    @PostMapping("/refresh")
    public Result<Void> refresh() {
        apiResourceService.refresh();
        return Result.success();
    }
}


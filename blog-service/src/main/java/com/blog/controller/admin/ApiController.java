package com.blog.controller.admin;

import com.blog.annotation.ApiOperation;
import com.blog.model.enums.ApiOperationType;
import com.blog.common.Result;
import com.blog.model.dto.ApiDTO;
import com.blog.model.vo.ApiVO;
import com.blog.service.ApiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/api")
@ApiOperation(value = "api", name = "接口管理模块", description = "接口管理接口", open = false)
public class ApiController {
    @Autowired
    private ApiService apiService;

    @GetMapping("/list")
    @ApiOperation(value = "list", name = "查询接口列表", type = ApiOperationType.QUERY, description = "查询所有接口")
    public Result<List<ApiVO>> list() {
        List<ApiVO> list = apiService.list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "detail", name = "获取接口详情", type = ApiOperationType.QUERY, description = "根据ID获取接口详情")
    public Result<ApiVO> getById(@PathVariable Long id) {
        ApiVO vo = apiService.getById(id);
        if (vo == null) {
            return Result.error(404, "接口不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(value = "create", name = "创建接口", type = ApiOperationType.CREATE, description = "创建新接口")
    public Result<Long> create(@Valid @RequestBody ApiDTO dto) {
        Long id = apiService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "update", name = "更新接口", type = ApiOperationType.UPDATE, description = "更新接口信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ApiDTO dto) {
        apiService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "delete", name = "删除接口", type = ApiOperationType.DELETE, description = "删除接口")
    public Result<Void> delete(@PathVariable Long id) {
        apiService.delete(id);
        return Result.success();
    }
}

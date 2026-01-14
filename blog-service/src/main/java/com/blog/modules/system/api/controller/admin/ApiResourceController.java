package com.blog.modules.system.api.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.dto.ApiDTO;
import com.blog.modules.system.api.model.vo.ApiRefreshResultVO;
import com.blog.modules.system.api.model.vo.ApiVO;
import com.blog.modules.system.api.service.ApiResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * API接口资源管理控制器
 * <p>
 * 提供统一的接口资源管理功能，包括查询、手动CRUD操作和自动刷新
 * </p>
 */
@RestController
@RequestMapping("/admin/api-resource")
@ApiOperation(name = "接口资源管理模块", description = "接口资源管理接口", open = false)
public class ApiResourceController {

    @Autowired
    private ApiResourceService apiResourceService;

    /**
     * 查询接口树形列表
     */
    @GetMapping("/tree")
    @ApiOperation(name = "查询接口树", type = ApiOperationType.QUERY, description = "查询所有接口（树形结构）")
    public Result<List<ApiVO>> tree() {
        List<ApiVO> tree = apiResourceService.tree();
        return Result.success(tree);
    }

    /**
     * 获取接口详情
     */
    @GetMapping("/{id}")
    @ApiOperation(name = "获取接口详情", type = ApiOperationType.QUERY, description = "根据ID获取接口详情")
    public Result<ApiVO> getById(@PathVariable Long id) {
        ApiVO vo = apiResourceService.getById(id);
        if (vo == null) {
            return Result.error(404, "接口不存在");
        }
        return Result.success(vo);
    }

    /**
     * 手动创建接口
     */
    @PostMapping
    @ApiOperation(name = "创建接口", type = ApiOperationType.CREATE, description = "手动创建新接口")
    public Result<Long> create(@Valid @RequestBody ApiDTO dto) {
        Long id = apiResourceService.create(dto);
        return Result.success(id);
    }

    /**
     * 更新接口信息
     */
    @PutMapping("/{id}")
    @ApiOperation(name = "更新接口", type = ApiOperationType.UPDATE, description = "更新接口信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ApiDTO dto) {
        apiResourceService.update(id, dto);
        return Result.success();
    }

    /**
     * 删除接口
     */
    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除接口", type = ApiOperationType.DELETE, description = "删除接口")
    public Result<Void> delete(@PathVariable Long id) {
        apiResourceService.delete(id);
        return Result.success();
    }

    /**
     * 刷新接口资源
     * 自动扫描系统中所有带注解的接口并同步到数据库
     */
    @PostMapping("/refresh")
    @ApiOperation(name = "刷新接口资源", type = ApiOperationType.OTHER, description = "自动扫描并刷新系统中的接口资源")
    public Result<ApiRefreshResultVO> refresh() {
        ApiRefreshResultVO result = apiResourceService.refresh();
        return Result.success(result);
    }
}

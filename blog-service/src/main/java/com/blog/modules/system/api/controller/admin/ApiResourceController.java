package com.blog.modules.system.api.controller.admin;



import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.dto.ApiResourceDTO;
import com.blog.modules.system.api.model.vo.ApiResourceVO;
import com.blog.modules.system.api.service.ApiResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/admin/api-resource")
@ApiOperation(name = "接口资源管理模块", description = "接口资源管理接口", open = false)
public class ApiResourceController {
    @Autowired
    private ApiResourceService apiResourceService;

    @GetMapping("/list")
    @ApiOperation(name = "查询接口资源列表", type = ApiOperationType.QUERY, description = "查询所有接口资源")
    public Result<List<ApiResourceVO>> list() {
        List<ApiResourceVO> list = apiResourceService.list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取接口资源详情", type = ApiOperationType.QUERY, description = "根据ID获取接口资源详情")
    public Result<ApiResourceVO> getById(@PathVariable Long id) {
        ApiResourceVO vo = apiResourceService.getById(id);
        if (vo == null) {
            return Result.error(404, "接口资源不存在");
        }
        return Result.success(vo);
    }

    @PutMapping("/{id}")
    @ApiOperation(name = "更新接口资源", type = ApiOperationType.UPDATE, description = "更新接口资源信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ApiResourceDTO dto) {
        apiResourceService.update(id, dto);
        return Result.success();
    }

    @PostMapping("/refresh")
    @ApiOperation(name = "刷新接口资源", type = ApiOperationType.OTHER, description = "刷新系统中的接口资源")
    public Result<Void> refresh() {
        apiResourceService.refresh();
        return Result.success();
    }
}


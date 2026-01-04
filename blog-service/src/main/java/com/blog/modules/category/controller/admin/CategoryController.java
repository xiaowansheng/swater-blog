package com.blog.modules.category.controller.admin;


import com.blog.common.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.common.Result;
import com.blog.modules.category.model.dto.CategoryDTO;
import com.blog.modules.category.model.vo.CategoryVO;
import com.blog.modules.category.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/admin/category")
@ApiOperation(name = "分类管理模块", description = "分类管理接口", open = false)
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping("/list")
    @ApiOperation(name = "查询分类列表", type = ApiOperationType.QUERY, description = "查询所有分类")
    public Result<List<CategoryVO>> list() {
        List<CategoryVO> categories = categoryService.list();
        return Result.success(categories);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取分类详情", type = ApiOperationType.QUERY, description = "根据ID获取分类详情")
    public Result<CategoryVO> getById(@PathVariable Long id) {
        CategoryVO vo = categoryService.getById(id);
        if (vo == null) {
            return Result.error(404, "分类不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(name = "创建分类", type = ApiOperationType.CREATE, description = "创建新分类")
    public Result<Long> create(@Valid @RequestBody CategoryDTO dto) {
        Long id = categoryService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(name = "更新分类", type = ApiOperationType.UPDATE, description = "更新分类信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody CategoryDTO dto) {
        categoryService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除分类", type = ApiOperationType.DELETE, description = "删除分类")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }
}


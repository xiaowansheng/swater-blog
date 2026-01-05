package com.blog.modules.category.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.category.model.vo.CategoryVO;
import com.blog.modules.category.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/public/category")
@ApiOperation(name = "分类公开接口", description = "文章分类相关接口", open = true)
public class CategoryPublicController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping("/list")
    @ApiOperation(name = "获取分类列表", type = ApiOperationType.QUERY, description = "获取所有可见的分类列表")
    public Result<List<CategoryVO>> list() {
        List<CategoryVO> categories = categoryService.listPublic();
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

    @GetMapping("/key/{key}")
    @ApiOperation(name = "根据Key获取分类详情", type = ApiOperationType.QUERY, description = "根据分类的Key获取分类详情")
    public Result<CategoryVO> getByKey(@PathVariable String key) {
        CategoryVO vo = categoryService.getByKey(key);
        if (vo == null) {
            return Result.error(404, "分类不存在");
        }
        return Result.success(vo);
    }
}


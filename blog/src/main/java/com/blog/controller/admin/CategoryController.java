package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.dto.CategoryDTO;
import com.blog.model.vo.CategoryVO;
import com.blog.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/category")
@ApiResource(name = "分类管理接口")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping("/list")
    public Result<List<CategoryVO>> list() {
        List<CategoryVO> categories = categoryService.list();
        return Result.success(categories);
    }

    @GetMapping("/{id}")
    public Result<CategoryVO> getById(@PathVariable Long id) {
        CategoryVO vo = categoryService.getById(id);
        if (vo == null) {
            return Result.error(404, "分类不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody CategoryDTO dto) {
        Long id = categoryService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody CategoryDTO dto) {
        categoryService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }
}


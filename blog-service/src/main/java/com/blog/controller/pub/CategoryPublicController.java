package com.blog.controller.pub;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.vo.CategoryVO;
import com.blog.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public/category")
@ApiResource(name = "分类公开接口", isOpen = true)
public class CategoryPublicController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping("/list")
    public Result<List<CategoryVO>> list() {
        List<CategoryVO> categories = categoryService.listPublic();
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
}


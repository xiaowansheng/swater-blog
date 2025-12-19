package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.dto.TagDTO;
import com.blog.model.vo.TagVO;
import com.blog.service.TagService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/tag")
@ApiResource(name = "标签管理接口")
public class TagController {
    @Autowired
    private TagService tagService;

    @GetMapping("/list")
    public Result<List<TagVO>> list() {
        List<TagVO> tags = tagService.list();
        return Result.success(tags);
    }

    @GetMapping("/{id}")
    public Result<TagVO> getById(@PathVariable Long id) {
        TagVO vo = tagService.getById(id);
        if (vo == null) {
            return Result.error(404, "标签不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody TagDTO dto) {
        Long id = tagService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody TagDTO dto) {
        tagService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        tagService.delete(id);
        return Result.success();
    }
}


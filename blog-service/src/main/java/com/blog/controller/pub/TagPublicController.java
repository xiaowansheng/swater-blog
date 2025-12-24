package com.blog.controller.pub;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.vo.TagVO;
import com.blog.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public/tag")
@ApiResource(name = "标签公开接口", isOpen = true)
public class TagPublicController {
    @Autowired
    private TagService tagService;

    @GetMapping("/list")
    public Result<List<TagVO>> list() {
        List<TagVO> tags = tagService.listPublic();
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
}


package com.blog.controller.pub;

import com.blog.annotation.ApiOperation;
import com.blog.common.Result;
import com.blog.model.enums.ApiOperationType;
import com.blog.model.vo.TagVO;
import com.blog.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public/tag")
@ApiOperation(name = "标签公开接口", description = "文章标签相关接口", open = true)
public class TagPublicController {
    @Autowired
    private TagService tagService;

    @GetMapping("/list")
    @ApiOperation(name = "获取标签列表", type = ApiOperationType.QUERY, description = "获取所有可见的标签列表")
    public Result<List<TagVO>> list() {
        List<TagVO> tags = tagService.listPublic();
        return Result.success(tags);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取标签详情", type = ApiOperationType.QUERY, description = "根据ID获取标签详情")
    public Result<TagVO> getById(@PathVariable Long id) {
        TagVO vo = tagService.getById(id);
        if (vo == null) {
            return Result.error(404, "标签不存在");
        }
        return Result.success(vo);
    }
}


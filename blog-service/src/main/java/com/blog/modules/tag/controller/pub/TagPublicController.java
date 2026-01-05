package com.blog.modules.tag.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.tag.model.vo.TagVO;
import com.blog.modules.tag.service.TagService;
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

    @GetMapping("/key/{key}")
    @ApiOperation(name = "根据Key获取标签详情", type = ApiOperationType.QUERY, description = "根据标签的Key获取标签详情")
    public Result<TagVO> getByKey(@PathVariable String key) {
        TagVO vo = tagService.getByKey(key);
        if (vo == null) {
            return Result.error(404, "标签不存在");
        }
        return Result.success(vo);
    }
}


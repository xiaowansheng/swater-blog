package com.blog.modules.tag.controller.admin;


import com.blog.common.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.common.Result;
import com.blog.modules.tag.model.dto.TagDTO;
import com.blog.modules.tag.model.vo.TagVO;
import com.blog.modules.tag.service.TagService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/admin/tag")
@ApiOperation(name = "标签管理模块", description = "标签管理接口", open = false)
public class TagController {
    @Autowired
    private TagService tagService;

    @GetMapping("/list")
    @ApiOperation(name = "查询标签列表", type = ApiOperationType.QUERY, description = "查询所有标签")
    public Result<List<TagVO>> list() {
        List<TagVO> tags = tagService.list();
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

    @PostMapping
    @ApiOperation(name = "创建标签", type = ApiOperationType.CREATE, description = "创建新标签")
    public Result<Long> create(@Valid @RequestBody TagDTO dto) {
        Long id = tagService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(name = "更新标签", type = ApiOperationType.UPDATE, description = "更新标签信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody TagDTO dto) {
        tagService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除标签", type = ApiOperationType.DELETE, description = "删除标签")
    public Result<Void> delete(@PathVariable Long id) {
        tagService.delete(id);
        return Result.success();
    }
}


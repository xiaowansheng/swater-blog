package com.blog.modules.talk.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.talk.model.dto.TalkDTO;
import com.blog.modules.talk.model.vo.TalkVO;
import com.blog.modules.talk.service.TalkAdminCommandService;
import com.blog.modules.talk.service.TalkAdminQueryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin/moment")
@ApiOperation(name = "说说管理模块", description = "说说管理接口", open = false)
public class TalkAdminController {
    @Autowired
    private TalkAdminQueryService talkAdminQueryService;

    @Autowired
    private TalkAdminCommandService talkAdminCommandService;

    @GetMapping("/list")
    @ApiOperation(name = "查询说说列表", type = ApiOperationType.QUERY,
            description = "分页查询说说列表")
    public Result<PageResult<TalkVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        PageResult<TalkVO> result = talkAdminQueryService.list(page, size);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取说说详情", type = ApiOperationType.QUERY,
            description = "根据ID获取说说详情")
    public Result<TalkVO> getById(@PathVariable Long id) {
        TalkVO vo = talkAdminQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "说说不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(name = "创建说说", type = ApiOperationType.CREATE,
            description = "创建新说说")
    public Result<Long> create(@Valid @RequestBody TalkDTO dto) {
        Long id = talkAdminCommandService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(name = "更新说说", type = ApiOperationType.UPDATE,
            description = "更新说说信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody TalkDTO dto) {
        talkAdminCommandService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        talkAdminCommandService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/top")
    @ApiOperation(name = "置顶说说", type = ApiOperationType.OTHER,
            description = "将说说置顶")
    public Result<Void> setTop(@PathVariable Long id) {
        talkAdminCommandService.setTop(id);
        return Result.success();
    }

    @PostMapping("/{id}/cancel-top")
    @ApiOperation(name = "取消置顶", type = ApiOperationType.OTHER,
            description = "取消说说置顶")
    public Result<Void> cancelTop(@PathVariable Long id) {
        talkAdminCommandService.cancelTop(id);
        return Result.success();
    }
}


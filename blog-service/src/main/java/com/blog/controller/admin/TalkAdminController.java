package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.TalkDTO;
import com.blog.model.vo.TalkVO;
import com.blog.service.TalkAdminCommandService;
import com.blog.service.TalkAdminQueryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/moment")
@ApiResource(name = "说说管理接口")
public class TalkAdminController {
    @Autowired
    private TalkAdminQueryService talkAdminQueryService;

    @Autowired
    private TalkAdminCommandService talkAdminCommandService;

    @GetMapping("/list")
    public Result<PageResult<TalkVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        PageResult<TalkVO> result = talkAdminQueryService.list(page, size);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<TalkVO> getById(@PathVariable Long id) {
        TalkVO vo = talkAdminQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "说说不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody TalkDTO dto) {
        Long id = talkAdminCommandService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
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
    public Result<Void> setTop(@PathVariable Long id) {
        talkAdminCommandService.setTop(id);
        return Result.success();
    }

    @PostMapping("/{id}/cancel-top")
    public Result<Void> cancelTop(@PathVariable Long id) {
        talkAdminCommandService.cancelTop(id);
        return Result.success();
    }
}


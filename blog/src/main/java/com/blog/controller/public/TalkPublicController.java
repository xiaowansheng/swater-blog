package com.blog.controller.public;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.TalkVO;
import com.blog.service.TalkPublicQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/moment")
@ApiResource(name = "说说公开接口", isOpen = true)
public class TalkPublicController {
    @Autowired
    private TalkPublicQueryService talkPublicQueryService;

    @GetMapping("/list")
    public Result<PageResult<TalkVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        PageResult<TalkVO> result = talkPublicQueryService.list(page, size);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<TalkVO> getById(@PathVariable Long id) {
        TalkVO vo = talkPublicQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "说说不存在");
        }
        return Result.success(vo);
    }
}


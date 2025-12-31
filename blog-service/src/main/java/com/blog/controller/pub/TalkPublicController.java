package com.blog.controller.pub;

import com.blog.annotation.ApiOperation;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.enums.ApiOperationType;
import com.blog.model.vo.TalkVO;
import com.blog.service.TalkPublicQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/moment")
@ApiOperation(name = "说说公开接口", description = "说说相关接口", open = true)
public class TalkPublicController {
    @Autowired
    private TalkPublicQueryService talkPublicQueryService;

    @GetMapping("/list")
    @ApiOperation(name = "获取说说列表", type = ApiOperationType.QUERY, description = "分页获取说说列表")
    public Result<PageResult<TalkVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        PageResult<TalkVO> result = talkPublicQueryService.list(page, size);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取说说详情", type = ApiOperationType.QUERY, description = "根据ID获取说说详情")
    public Result<TalkVO> getById(@PathVariable Long id) {
        TalkVO vo = talkPublicQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "说说不存在");
        }
        return Result.success(vo);
    }
}


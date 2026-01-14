package com.blog.modules.talk.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.talk.model.vo.TalkVO;
import com.blog.modules.talk.service.TalkPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("public/moment")
@ApiOperation(name = "说说公开接口", description = "说说相关接口", open = true)
public class TalkPublicController {
    @Autowired
    private TalkPublicService talkPublicService;

    @GetMapping("/list")
    @ApiOperation(name = "获取说说列表", type = ApiOperationType.QUERY, description = "分页获取说说列表")
    public Result<PageResult<TalkVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        PageResult<TalkVO> result = talkPublicService.list(page, size);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取说说详情", type = ApiOperationType.QUERY, description = "根据ID获取说说详情")
    public Result<TalkVO> getById(@PathVariable Long id) {
        TalkVO vo = talkPublicService.getById(id);
        if (vo == null) {
            return Result.error(404, "说说不存在");
        }
        return Result.success(vo);
    }

    @GetMapping("/key/{key}")
    @ApiOperation(name = "根据Key获取说说详情", type = ApiOperationType.QUERY, description = "根据说说的Key获取说说详情")
    public Result<TalkVO> getByKey(@PathVariable String key) {
        TalkVO vo = talkPublicService.getByKey(key);
        if (vo == null) {
            return Result.error(404, "说说不存在");
        }
        return Result.success(vo);
    }
}


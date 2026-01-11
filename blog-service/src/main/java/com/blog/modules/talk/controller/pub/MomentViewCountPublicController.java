package com.blog.modules.talk.controller.pub;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.shared.Result;
import com.blog.shared.annotation.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/moment")
@ApiOperation(name = "说说阅读量接口（V2）", description = "读取说说当前阅读量（不自增）", open = true)
public class MomentViewCountPublicController {
    @Autowired
    private TalkMapper talkMapper;

    @GetMapping("/{id}/view-count")
    @ApiOperation(name = "获取说说阅读数", type = ApiOperationType.QUERY, description = "获取说说当前阅读数（不增加阅读数）")
    public Result<Integer> getViewCount(@PathVariable Long id) {
        Talk talk = talkMapper.selectOne(new LambdaQueryWrapper<Talk>()
                .select(Talk::getViewCount)
                .eq(Talk::getId, id)
                .eq(Talk::getDeleted, 0)
                .eq(Talk::getStatus, "1")
                .last("LIMIT 1"));
        if (talk == null) {
            return Result.error(404, "说说不存在");
        }
        return Result.success(talk.getViewCount() != null ? talk.getViewCount() : 0);
    }
}


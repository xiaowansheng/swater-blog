package com.blog.modules.talk.controller.pub;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.shared.Result;
import com.blog.shared.annotation.ApiOperation;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("public/moment")
@ApiOperation(name = "说说统计接口（V2）", description = "批量读取说说统计字段（不自增）", open = true)
public class MomentStatsPublicController {
    @Autowired
    private TalkMapper talkMapper;

    @GetMapping("/stats")
    @ApiOperation(name = "批量获取说说统计", type = ApiOperationType.QUERY, description = "批量获取说说浏览/点赞/评论数（不增加浏览数）")
    public Result<List<MomentStatsVO>> getStats(@RequestParam String ids) {
        List<Long> idList = parseIds(ids);
        if (idList.isEmpty()) {
            return Result.success(List.of());
        }

        List<Talk> talks = talkMapper.selectList(new LambdaQueryWrapper<Talk>()
                .select(Talk::getId, Talk::getViewCount, Talk::getLikeCount, Talk::getCommentCount)
                .in(Talk::getId, idList)
                .eq(Talk::getDeleted, 0)
                .eq(Talk::getStatus, "1"));

        List<MomentStatsVO> voList = talks.stream().map(t -> {
            MomentStatsVO vo = new MomentStatsVO();
            vo.setId(t.getId());
            vo.setViewCount(t.getViewCount() != null ? t.getViewCount() : 0);
            vo.setLikeCount(t.getLikeCount() != null ? t.getLikeCount() : 0);
            vo.setCommentCount(t.getCommentCount() != null ? t.getCommentCount() : 0);
            return vo;
        }).collect(Collectors.toList());

        return Result.success(voList);
    }

    @GetMapping("/{id}/stats")
    @ApiOperation(name = "获取说说统计", type = ApiOperationType.QUERY, description = "获取说说浏览/点赞/评论数（不增加浏览数）")
    public Result<MomentStatsVO> getStatsById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return Result.error(400, "id不能为空");
        }

        Talk talk = talkMapper.selectOne(new LambdaQueryWrapper<Talk>()
                .select(Talk::getId, Talk::getViewCount, Talk::getLikeCount, Talk::getCommentCount)
                .eq(Talk::getId, id)
                .eq(Talk::getDeleted, 0)
                .eq(Talk::getStatus, "1")
                .last("LIMIT 1"));
        if (talk == null) {
            return Result.error(404, "说说不存在");
        }

        MomentStatsVO vo = new MomentStatsVO();
        vo.setId(talk.getId());
        vo.setViewCount(talk.getViewCount() != null ? talk.getViewCount() : 0);
        vo.setLikeCount(talk.getLikeCount() != null ? talk.getLikeCount() : 0);
        vo.setCommentCount(talk.getCommentCount() != null ? talk.getCommentCount() : 0);
        return Result.success(vo);
    }

    private List<Long> parseIds(String ids) {
        if (!StringUtils.hasText(ids)) {
            return List.of();
        }
        return Arrays.stream(ids.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(s -> {
                    try {
                        return Long.parseLong(s);
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(v -> v != null && v > 0)
                .distinct()
                .limit(200)
                .collect(Collectors.toList());
    }

    @Data
    public static class MomentStatsVO {
        private Long id;
        private Integer viewCount;
        private Integer likeCount;
        private Integer commentCount;
    }
}

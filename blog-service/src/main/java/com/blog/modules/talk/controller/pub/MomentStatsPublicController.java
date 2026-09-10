package com.blog.modules.talk.controller.pub;


import com.blog.shared.model.enums.ApiOperationType;
import com.blog.modules.talk.model.vo.MomentStatsVO;
import com.blog.modules.talk.service.TalkPublicService;
import com.blog.shared.Result;
import com.blog.shared.annotation.ApiOperation;
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
@RequestMapping("/api/public/moment")
@ApiOperation(name = "说说统计接口（V2）", description = "批量读取说说统计字段（不自增）", open = true)
public class MomentStatsPublicController {

    @Autowired
    private TalkPublicService talkPublicService;

    @GetMapping("/stats")
    @ApiOperation(name = "批量获取说说统计", type = ApiOperationType.QUERY, description = "批量获取说说浏览/点赞/评论数（不增加浏览数）")
    public Result<List<MomentStatsVO>> getStats(@RequestParam String ids) {
        return Result.success(talkPublicService.getStatsByIds(parseIds(ids)));
    }

    @GetMapping("/{id}/stats")
    @ApiOperation(name = "获取说说统计", type = ApiOperationType.QUERY, description = "获取说说浏览/点赞/评论数（不增加浏览数）")
    public Result<MomentStatsVO> getStatsById(@PathVariable Long id) {
        MomentStatsVO vo = talkPublicService.getTalkStats(id);
        if (vo == null) {
            return Result.error(404, "说说不存在");
        }
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
}

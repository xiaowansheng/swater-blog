package com.blog.modules.article.controller.pub;


import com.blog.modules.article.model.vo.ArticleStatsVO;
import com.blog.modules.article.service.ArticlePublicService;
import com.blog.shared.model.enums.ApiOperationType;
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
@RequestMapping("/api/public/post")
@ApiOperation(name = "文章统计接口（V2）", description = "批量读取文章统计字段（不自增）", open = true)
public class ArticleStatsPublicController {

    @Autowired
    private ArticlePublicService articlePublicService;

    @GetMapping("/stats")
    @ApiOperation(name = "批量获取文章统计", type = ApiOperationType.QUERY, description = "批量获取文章浏览/点赞/评论数（不增加浏览数）")
    public Result<List<ArticleStatsVO>> getStats(@RequestParam String ids) {
        return Result.success(articlePublicService.getStatsByIds(parseIds(ids)));
    }

    @GetMapping("/{id}/stats")
    @ApiOperation(name = "获取文章统计", type = ApiOperationType.QUERY, description = "获取文章浏览/点赞/评论数（不增加浏览数）")
    public Result<ArticleStatsVO> getStatsById(@PathVariable Long id) {
        ArticleStatsVO vo = articlePublicService.getArticleStats(id);
        if (vo == null) {
            return Result.error(404, "文章不存在");
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

package com.blog.modules.article.controller.pub;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.system.api.model.enums.ApiOperationType;
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
@RequestMapping("public/post")
@ApiOperation(name = "文章统计接口（V2）", description = "批量读取文章统计字段（不自增）", open = true)
public class ArticleStatsPublicController {
    @Autowired
    private ArticleMapper articleMapper;

    @GetMapping("/stats")
    @ApiOperation(name = "批量获取文章统计", type = ApiOperationType.QUERY, description = "批量获取文章浏览/点赞/评论数（不增加浏览数）")
    public Result<List<ArticleStatsVO>> getStats(@RequestParam String ids) {
        List<Long> idList = parseIds(ids);
        if (idList.isEmpty()) {
            return Result.success(List.of());
        }

        List<Article> articles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .select(Article::getId, Article::getViewCount, Article::getLikeCount, Article::getCommentCount)
                .in(Article::getId, idList)
                .eq(Article::getDeleted, 0)
                .eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode()));

        List<ArticleStatsVO> voList = articles.stream().map(a -> {
            ArticleStatsVO vo = new ArticleStatsVO();
            vo.setId(a.getId());
            vo.setViewCount(a.getViewCount() != null ? a.getViewCount() : 0);
            vo.setLikeCount(a.getLikeCount() != null ? a.getLikeCount() : 0);
            vo.setCommentCount(a.getCommentCount() != null ? a.getCommentCount() : 0);
            return vo;
        }).collect(Collectors.toList());

        return Result.success(voList);
    }

    @GetMapping("/{id}/stats")
    @ApiOperation(name = "获取文章统计", type = ApiOperationType.QUERY, description = "获取文章浏览/点赞/评论数（不增加浏览数）")
    public Result<ArticleStatsVO> getStatsById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return Result.error(400, "id不能为空");
        }

        Article article = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .select(Article::getId, Article::getViewCount, Article::getLikeCount, Article::getCommentCount)
                .eq(Article::getId, id)
                .eq(Article::getDeleted, 0)
                .eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode())
                .last("LIMIT 1"));
        if (article == null) {
            return Result.error(404, "文章不存在");
        }

        ArticleStatsVO vo = new ArticleStatsVO();
        vo.setId(article.getId());
        vo.setViewCount(article.getViewCount() != null ? article.getViewCount() : 0);
        vo.setLikeCount(article.getLikeCount() != null ? article.getLikeCount() : 0);
        vo.setCommentCount(article.getCommentCount() != null ? article.getCommentCount() : 0);
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
    public static class ArticleStatsVO {
        private Long id;
        private Integer viewCount;
        private Integer likeCount;
        private Integer commentCount;
    }
}

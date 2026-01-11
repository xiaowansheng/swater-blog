package com.blog.modules.article.controller.pub;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.shared.annotation.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/post")
@ApiOperation(name = "文章阅读量接口（V2）", description = "读取文章当前阅读量（不自增）", open = true)
public class ArticleViewCountPublicController {
    @Autowired
    private ArticleMapper articleMapper;

    @GetMapping("/{id}/view-count")
    @ApiOperation(name = "获取文章阅读数", type = ApiOperationType.QUERY, description = "获取文章当前阅读数（不增加阅读数）")
    public Result<Integer> getViewCount(@PathVariable Long id) {
        Article article = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .select(Article::getViewCount)
                .eq(Article::getId, id)
                .eq(Article::getDeleted, 0)
                .eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode())
                .last("LIMIT 1"));
        if (article == null) {
            return Result.error(404, "文章不存在");
        }
        return Result.success(article.getViewCount() != null ? article.getViewCount() : 0);
    }
}


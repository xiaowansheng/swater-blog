package com.blog.controller.pub;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.ArticleVO;
import com.blog.service.ArticlePublicQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public/post")
@ApiResource(name = "文章公开接口", isOpen = true)
public class ArticlePublicController {
    @Autowired
    private ArticlePublicQueryService articlePublicQueryService;

    @GetMapping("/list")
    public Result<PageResult<ArticleVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) String keyword) {
        PageResult<ArticleVO> result = articlePublicQueryService.list(page, size, categoryId, tagId, keyword);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<ArticleVO> getById(@PathVariable Long id) {
        ArticleVO vo = articlePublicQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "文章不存在");
        }
        return Result.success(vo);
    }

    @GetMapping("/slug/{slug}")
    public Result<ArticleVO> getBySlug(@PathVariable String slug) {
        ArticleVO vo = articlePublicQueryService.getBySlug(slug);
        if (vo == null) {
            return Result.error(404, "文章不存在");
        }
        return Result.success(vo);
    }

    @GetMapping("/hot")
    public Result<List<ArticleVO>> getHotArticles(@RequestParam(required = false) Integer limit) {
        List<ArticleVO> articles = articlePublicQueryService.getHotArticles(limit);
        return Result.success(articles);
    }

    @GetMapping("/latest")
    public Result<List<ArticleVO>> getLatestArticles(@RequestParam(required = false) Integer limit) {
        List<ArticleVO> articles = articlePublicQueryService.getLatestArticles(limit);
        return Result.success(articles);
    }
}


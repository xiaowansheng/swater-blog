package com.blog.modules.article.controller.pub;


import com.blog.shared.annotation.ApiDocumentation;
import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.annotation.RateLimit;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.shared.model.enums.ApiOperationType;
import com.blog.modules.article.model.vo.ArticleUnlockVO;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.article.model.dto.ArticlePasswordVerifyDTO;
import com.blog.modules.article.service.ArticlePublicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/public/post")
@ApiOperation(name = "文章公开接口", description = "文章相关接口", open = true)
@Tag(name = "文章公开接口", description = "文章相关的公开API，无需认证即可访问")
@ApiDocumentation.PublicApi
public class ArticlePublicController {
    @Autowired
    private ArticlePublicService articlePublicService;

    @GetMapping("/list")
    @ApiOperation(name = "获取文章列表", type = ApiOperationType.QUERY, description = "获取已发布的文章列表，支持分页和多种筛选条件")
    @Operation(
        summary = "获取文章列表",
        description = """
            获取已发布的文章列表，支持分页和多种筛选条件。

            **功能特性：**
            - 支持按分类筛选
            - 支持按标签筛选
            - 支持关键词搜索
            - 自动分页处理
            - 按发布时间倒序排列

            **使用示例：**
            - 获取第一页：`/api/public/post/list?page=1&size=10`
            - 按分类筛选：`/api/public/post/list?categoryId=1`
            - 关键词搜索：`/api/public/post/list?keyword=Spring Boot`
            """
    )
    @ApiDocumentation.PagedApiResponse
    @ApiDocumentation.StandardApiResponses
    @ApiDocumentation.PageParams
    public Result<PageResult<ArticleVO>> list(
            @Parameter(description = "当前页码，从1开始", example = "1")
            @RequestParam(required = false) Long page,
            
            @Parameter(description = "每页大小，默认10，最大100", example = "10")
            @RequestParam(required = false) Long size,
            
            @Parameter(description = "分类ID，筛选指定分类的文章", example = "1")
            @RequestParam(required = false) Long categoryId,
            
            @Parameter(description = "标签ID，筛选包含指定标签的文章", example = "1")
            @RequestParam(required = false) Long tagId,
            
            @Parameter(description = "搜索关键词，在标题和内容中搜索", example = "Spring Boot")
            @RequestParam(required = false) String keyword) {
        PageResult<ArticleVO> result = articlePublicService.list(page, size, categoryId, tagId, keyword);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "根据ID获取文章详情", type = ApiOperationType.QUERY, description = "根据文章ID获取文章的详细信息")
    @Operation(
        summary = "根据ID获取文章详情",
        description = """
            根据文章ID获取文章的详细信息。

            **注意事项：**
            - 只能获取已发布的文章
            - 会自动增加文章浏览量
            - 返回完整的文章内容和元数据
            """
    )
    @ApiResponse(
        responseCode = "200",
        description = "获取成功",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                value = """
                    {
                      "code": 200,
                      "message": "success",
                      "data": {
                        "id": 1,
                        "title": "Spring Boot入门教程",
                        "content": "文章内容...",
                        "excerpt": "文章摘要",
                        "cover": "https://example.com/cover.jpg",
                        "categoryName": "技术分享",
                        "tags": ["Spring Boot", "Java"],
                        "viewCount": 100,
                        "likeCount": 10,
                        "commentCount": 5,
                        "publishedAt": "2024-01-01T12:00:00"
                      }
                    }
                    """
            )
        )
    )
    @ApiDocumentation.StandardApiResponses
    public Result<ArticleVO> getById(
            @Parameter(description = "文章ID", required = true, example = "1")
            @PathVariable Long id) {
        ArticleVO vo = articlePublicService.getById(id);
        if (vo == null) {
            return Result.error(404, "文章不存在");
        }
        return Result.success(vo);
    }

    @GetMapping("/slug/{slug}")
    @ApiOperation(name = "根据Slug获取文章详情", type = ApiOperationType.QUERY, description = "根据文章的URL别名(slug)获取文章详情")
    @Operation(
        summary = "根据Slug获取文章详情",
        description = """
            根据文章的URL别名(slug)获取文章详情。

            **使用场景：**
            - SEO友好的URL
            - 永久链接访问
            - 文章分享链接
            """
    )
    @ApiDocumentation.StandardApiResponses
    public Result<ArticleVO> getBySlug(
            @Parameter(description = "文章URL别名", required = true, example = "spring-boot-tutorial")
            @PathVariable String slug) {
        ArticleVO vo = articlePublicService.getBySlug(slug);
        if (vo == null) {
            return Result.error(404, "文章不存在");
        }
        return Result.success(vo);
    }

    @GetMapping("/key/{key}")
    @ApiOperation(name = "根据Key获取文章详情", type = ApiOperationType.QUERY, description = "根据文章的Key获取文章详情")
    @Operation(
        summary = "根据Key获取文章详情",
        description = """
            根据文章的Key获取文章详情。

            **使用场景：**
            - 内部标识符访问
            - 稳定的文章链接
            """
    )
    @ApiDocumentation.StandardApiResponses
    public Result<ArticleVO> getByKey(
            @Parameter(description = "文章Key", required = true, example = "article-123")
            @PathVariable String key) {
        ArticleVO vo = articlePublicService.getByKey(key);
        if (vo == null) {
            return Result.error(404, "文章不存在");
        }
        return Result.success(vo);
    }

    @GetMapping("/hot")
    @ApiOperation(name = "获取热门文章", type = ApiOperationType.QUERY, description = "获取热门文章列表，按浏览量和点赞数排序")
    @Operation(
        summary = "获取热门文章",
        description = """
            获取热门文章列表，按浏览量和点赞数排序。

            **排序规则：**
            1. 优先按点赞数排序
            2. 其次按浏览量排序
            3. 最后按发布时间排序
            """
    )
    @ApiResponse(
        responseCode = "200",
        description = "获取成功",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                value = """
                    {
                      "code": 200,
                      "message": "success",
                      "data": [
                        {
                          "id": 1,
                          "title": "热门文章标题",
                          "excerpt": "文章摘要",
                          "cover": "https://example.com/cover.jpg",
                          "viewCount": 1000,
                          "likeCount": 50,
                          "publishedAt": "2024-01-01T12:00:00"
                        }
                      ]
                    }
                    """
            )
        )
    )
    @ApiDocumentation.StandardApiResponses
    public Result<List<ArticleVO>> getHotArticles(
            @Parameter(description = "返回数量限制，默认10，最大50", example = "10")
            @RequestParam(required = false) Integer limit) {
        List<ArticleVO> articles = articlePublicService.getHotArticles(limit);
        return Result.success(articles);
    }

    @GetMapping("/latest")
    @ApiOperation(name = "获取最新文章", type = ApiOperationType.QUERY, description = "获取最新发布的文章列表")
    public Result<List<ArticleVO>> getLatestArticles(@RequestParam(required = false) Integer limit) {
        List<ArticleVO> articles = articlePublicService.getLatestArticles(limit);
        return Result.success(articles);
    }

    @GetMapping("/{id}/related")
    @ApiOperation(name = "获取相关文章推荐", type = ApiOperationType.QUERY, description = "基于标签共现和分类获取相关文章推荐")
    public Result<List<ArticleVO>> getRelatedArticles(
            @PathVariable Long id,
            @RequestParam(required = false) Integer limit) {
        List<ArticleVO> articles = articlePublicService.getRelatedArticles(id, limit);
        return Result.success(articles);
    }

    @PostMapping("/{id}/verify-password")
    @RateLimit(
        type = RateLimit.Type.SLIDING_WINDOW,
        dimension = RateLimit.Dimension.IP,
        window = 60,
        limit = 5,
        message = "密码验证尝试过于频繁，请稍后再试"
    )
    @ApiOperation(name = "验证文章密码", type = ApiOperationType.QUERY, description = "验证密码获取文章内容并签发解锁 token")
    public Result<ArticleUnlockVO> verifyPassword(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody ArticlePasswordVerifyDTO body) {
        String token = articlePublicService.verifyAndIssueToken(id, body.getPassword());
        if (token == null) {
            return Result.error(403, "密码错误");
        }
        ArticleUnlockVO result = new ArticleUnlockVO();
        result.setToken(token);
        result.setArticle(articlePublicService.getByIdWithContent(id));
        return Result.success(result);
    }

    @GetMapping("/{id}/unlocked-content")
    @ApiOperation(name = "凭解锁 token 获取文章正文", type = ApiOperationType.QUERY, description = "凭 verify-password 返回的 token 复用解锁，无需重复输入密码")
    public Result<ArticleVO> getUnlockedContent(
            @PathVariable Long id,
            @RequestParam String token) {
        ArticleVO vo = articlePublicService.getByUnlockToken(id, token);
        if (vo == null) {
            return Result.error(403, "解锁凭证无效或已过期");
        }
        return Result.success(vo);
    }
}


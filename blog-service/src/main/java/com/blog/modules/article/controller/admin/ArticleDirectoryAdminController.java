package com.blog.modules.article.controller.admin;

import com.blog.modules.article.model.dto.ArticleDirectoryAssignArticleDTO;
import com.blog.modules.article.model.dto.ArticleDirectoryCreateArticleDTO;
import com.blog.modules.article.model.dto.ArticleDirectoryMoveDTO;
import com.blog.modules.article.model.dto.DirectoryNodeDTO;
import com.blog.modules.article.model.vo.ArticleDirectoryItemVO;
import com.blog.modules.article.service.ArticleDirectoryService;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.shared.annotation.ApiOperation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/article-directory")
@ApiOperation(name = "文章目录树模块", description = "文件夹式管理文章目录、文章位置与排序", open = false)
public class ArticleDirectoryAdminController {
    @Autowired
    private ArticleDirectoryService articleDirectoryService;

    @GetMapping("/tree")
    @ApiOperation(name = "查询文章目录树", type = ApiOperationType.QUERY,
            description = "查询文件夹式文章目录树，包含节点和文章")
    public Result<List<ArticleDirectoryItemVO>> tree() {
        return Result.success(articleDirectoryService.tree());
    }

    @PostMapping("/nodes")
    @ApiOperation(name = "创建文章目录节点", type = ApiOperationType.CREATE,
            description = "创建文件夹式文章目录节点")
    public Result<Long> createNode(@Valid @RequestBody DirectoryNodeDTO dto) {
        return Result.success(articleDirectoryService.createNode(dto));
    }

    @PutMapping("/nodes/{id}")
    @ApiOperation(name = "更新文章目录节点", type = ApiOperationType.UPDATE,
            description = "更新文件夹式文章目录节点")
    public Result<Void> updateNode(@PathVariable Long id, @Valid @RequestBody DirectoryNodeDTO dto) {
        articleDirectoryService.updateNode(id, dto);
        return Result.success();
    }

    @DeleteMapping("/nodes/{id}")
    @ApiOperation(name = "删除文章目录节点", type = ApiOperationType.DELETE,
            description = "删除空的文件夹式文章目录节点")
    public Result<Void> deleteNode(@PathVariable Long id) {
        articleDirectoryService.deleteNode(id);
        return Result.success();
    }

    @PutMapping("/items/move")
    @ApiOperation(name = "移动文章目录项目", type = ApiOperationType.UPDATE,
            description = "移动目录节点或文章，并更新同级排序")
    public Result<Void> move(@Valid @RequestBody ArticleDirectoryMoveDTO dto) {
        articleDirectoryService.move(dto);
        return Result.success();
    }

    @PostMapping("/articles/assign")
    @ApiOperation(name = "添加已有文章到目录", type = ApiOperationType.UPDATE,
            description = "将已有文章移动到指定目录节点或根目录")
    public Result<Void> assignArticle(@Valid @RequestBody ArticleDirectoryAssignArticleDTO dto) {
        articleDirectoryService.assignArticle(dto);
        return Result.success();
    }

    @PostMapping("/articles/create")
    @ApiOperation(name = "在目录中新建文章", type = ApiOperationType.CREATE,
            description = "创建草稿文章并放入指定目录节点或根目录")
    public Result<Long> createArticle(@Valid @RequestBody ArticleDirectoryCreateArticleDTO dto) {
        return Result.success(articleDirectoryService.createArticle(dto));
    }
}

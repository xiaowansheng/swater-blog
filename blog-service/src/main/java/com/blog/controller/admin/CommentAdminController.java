package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.CommentVO;
import com.blog.service.CommentAdminCommandService;
import com.blog.service.CommentAdminQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/comment")
@ApiResource(name = "评论管理接口")
public class CommentAdminController {
    @Autowired
    private CommentAdminQueryService commentAdminQueryService;

    @Autowired
    private CommentAdminCommandService commentAdminCommandService;

    @GetMapping("/list")
    public Result<PageResult<CommentVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long postId,
            @RequestParam(required = false) Long momentId) {
        PageResult<CommentVO> result = commentAdminQueryService.list(page, size, status, postId, momentId);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<CommentVO> getById(@PathVariable Long id) {
        CommentVO vo = commentAdminQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "评论不存在");
        }
        return Result.success(vo);
    }

    @PostMapping("/{id}/approve")
    public Result<Void> approve(@PathVariable Long id) {
        commentAdminCommandService.approve(id);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    public Result<Void> reject(@PathVariable Long id) {
        commentAdminCommandService.reject(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        commentAdminCommandService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/visible")
    public Result<Void> setVisible(@PathVariable Long id) {
        commentAdminCommandService.setVisible(id);
        return Result.success();
    }

    @PostMapping("/{id}/hidden")
    public Result<Void> setHidden(@PathVariable Long id) {
        commentAdminCommandService.setHidden(id);
        return Result.success();
    }
}


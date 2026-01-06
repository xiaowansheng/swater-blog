package com.blog.modules.comment.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.modules.comment.service.CommentCommandService;
import com.blog.modules.comment.service.CommentQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin/comment")
@ApiOperation(name = "评论管理模块", description = "评论管理接口", open = false)
public class CommentAdminController {
    @Autowired
    private CommentQueryService commentQueryService;

    @Autowired
    private CommentCommandService commentCommandService;

    @GetMapping("/list")
    @ApiOperation(name = "查询评论列表", type = ApiOperationType.QUERY,
            description = "分页查询评论列表")
    public Result<PageResult<CommentVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long targetId,
            @RequestParam(required = false) String targetType) {
        PageResult<CommentVO> result = commentQueryService.list(page, size, status, targetId, targetType);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取评论详情", type = ApiOperationType.QUERY,
            description = "根据ID获取评论详情")
    public Result<CommentVO> getById(@PathVariable Long id) {
        CommentVO vo = commentQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "评论不存在");
        }
        return Result.success(vo);
    }

    @PostMapping("/{id}/approve")
    @ApiOperation(name = "审核通过", type = ApiOperationType.ENABLE,
            description = "审核通过评论")
    public Result<Void> approve(@PathVariable Long id) {
        commentCommandService.approve(id);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    @ApiOperation(name = "审核拒绝", type = ApiOperationType.DISABLE,
            description = "审核拒绝评论")
    public Result<Void> reject(@PathVariable Long id) {
        commentCommandService.reject(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除评论", type = ApiOperationType.DELETE,
            description = "删除评论")
    public Result<Void> delete(@PathVariable Long id) {
        commentCommandService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/visible")
    @ApiOperation(name = "设置为可见", type = ApiOperationType.ENABLE,
            description = "设置评论为可见状态")
    public Result<Void> setVisible(@PathVariable Long id) {
        commentCommandService.setVisible(id);
        return Result.success();
    }

    @PostMapping("/{id}/hidden")
    @ApiOperation(name = "设置为隐藏", type = ApiOperationType.DISABLE,
            description = "设置评论为隐藏状态")
    public Result<Void> setHidden(@PathVariable Long id) {
        commentCommandService.setHidden(id);
        return Result.success();
    }
}

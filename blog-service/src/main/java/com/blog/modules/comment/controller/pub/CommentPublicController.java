package com.blog.modules.comment.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.modules.comment.service.CommentPublicService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/public/comment")
@ApiOperation(name = "评论公开接口", description = "评论相关接口", open = true)
public class CommentPublicController {
    @Autowired
    private CommentPublicService commentPublicService;

    @GetMapping("/list")
    @ApiOperation(name = "获取评论列表", type = ApiOperationType.QUERY, description = "分页获取评论列表，可按目标对象筛选")
    public Result<PageResult<CommentVO>> list(
            @RequestParam(required = false) Long targetId,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) Long rootId,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        PageResult<CommentVO> result = commentPublicService.list(targetId, targetType, parentId, rootId, sort, page, size);
        return Result.success(result);
    }

    @PostMapping
    @ApiOperation(name = "创建评论", type = ApiOperationType.CREATE, description = "创建新的评论")
    public Result<CommentVO> create(@Valid @RequestBody CommentDTO dto) {
        CommentVO vo = commentPublicService.create(dto);
        return Result.success(vo);
    }
}


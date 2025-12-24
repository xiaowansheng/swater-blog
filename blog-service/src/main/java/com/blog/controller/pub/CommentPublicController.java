package com.blog.controller.pub;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.CommentDTO;
import com.blog.model.vo.CommentVO;
import com.blog.service.CommentPublicCommandService;
import com.blog.service.CommentPublicQueryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/comment")
@ApiResource(name = "评论公开接口", isOpen = true)
public class CommentPublicController {
    @Autowired
    private CommentPublicQueryService commentPublicQueryService;

    @Autowired
    private CommentPublicCommandService commentPublicCommandService;

    @GetMapping("/list")
    public Result<PageResult<CommentVO>> list(
            @RequestParam(required = false) Long postId,
            @RequestParam(required = false) Long momentId,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        PageResult<CommentVO> result = commentPublicQueryService.list(postId, momentId, page, size);
        return Result.success(result);
    }

    @PostMapping
    public Result<CommentVO> create(@Valid @RequestBody CommentDTO dto) {
        CommentVO vo = commentPublicCommandService.create(dto);
        return Result.success(vo);
    }
}


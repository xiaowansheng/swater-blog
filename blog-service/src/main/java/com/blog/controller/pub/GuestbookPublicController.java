package com.blog.controller.pub;

import com.blog.annotation.ApiOperation;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.GuestbookDTO;
import com.blog.model.enums.ApiOperationType;
import com.blog.model.vo.GuestbookVO;
import com.blog.service.GuestbookPublicCommandService;
import com.blog.service.GuestbookPublicQueryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/guestbook")
@ApiOperation(value = "pub:guestbook", name = "留言簿公开接口", description = "留言簿相关接口", open = true)
public class GuestbookPublicController {
    @Autowired
    private GuestbookPublicQueryService guestbookPublicQueryService;

    @Autowired
    private GuestbookPublicCommandService guestbookPublicCommandService;

    @GetMapping("/list")
    @ApiOperation(value = "query", name = "获取留言列表", type = ApiOperationType.QUERY, description = "分页获取留言列表")
    public Result<PageResult<GuestbookVO>> list(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size) {
        PageResult<GuestbookVO> result = guestbookPublicQueryService.list(page, size);
        return Result.success(result);
    }

    @PostMapping
    @ApiOperation(value = "create", name = "提交留言", type = ApiOperationType.CREATE, description = "提交新的留言")
    public Result<GuestbookVO> submit(@Valid @RequestBody GuestbookDTO dto) {
        GuestbookVO vo = guestbookPublicCommandService.submit(dto);
        return Result.success(vo);
    }
}


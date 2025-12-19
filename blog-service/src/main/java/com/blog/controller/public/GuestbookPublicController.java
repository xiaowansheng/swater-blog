package com.blog.controller.public;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.GuestbookDTO;
import com.blog.model.vo.GuestbookVO;
import com.blog.service.GuestbookPublicCommandService;
import com.blog.service.GuestbookPublicQueryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/guestbook")
@ApiResource(name = "留言簿公开接口", isOpen = true)
public class GuestbookPublicController {
    @Autowired
    private GuestbookPublicQueryService guestbookPublicQueryService;

    @Autowired
    private GuestbookPublicCommandService guestbookPublicCommandService;

    @GetMapping("/list")
    public Result<PageResult<GuestbookVO>> list(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size) {
        PageResult<GuestbookVO> result = guestbookPublicQueryService.list(page, size);
        return Result.success(result);
    }

    @PostMapping
    public Result<GuestbookVO> submit(@Valid @RequestBody GuestbookDTO dto) {
        GuestbookVO vo = guestbookPublicCommandService.submit(dto);
        return Result.success(vo);
    }
}


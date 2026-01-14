package com.blog.modules.guestbook.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.guestbook.model.dto.GuestbookDTO;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
import com.blog.modules.guestbook.service.GuestbookPublicService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("public/guestbook")
@ApiOperation(name = "留言簿公开接口", description = "留言簿相关接口", open = true)
public class GuestbookPublicController {
    @Autowired
    private GuestbookPublicService guestbookPublicService;

    @GetMapping("/list")
    @ApiOperation(name = "获取留言列表", type = ApiOperationType.QUERY, description = "分页获取留言列表")
    public Result<PageResult<GuestbookVO>> list(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size) {
        PageResult<GuestbookVO> result = guestbookPublicService.list(page, size);
        return Result.success(result);
    }

    @PostMapping
    @ApiOperation(name = "提交留言", type = ApiOperationType.CREATE, description = "提交新的留言")
    public Result<GuestbookVO> submit(@Valid @RequestBody GuestbookDTO dto) {
        GuestbookVO vo = guestbookPublicService.submit(dto);
        return Result.success(vo);
    }
}


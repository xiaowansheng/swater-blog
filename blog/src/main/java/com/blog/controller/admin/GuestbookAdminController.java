package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.GuestbookVO;
import com.blog.service.GuestbookAdminCommandService;
import com.blog.service.GuestbookAdminQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/guestbook")
@ApiResource(name = "留言簿管理接口")
public class GuestbookAdminController {
    @Autowired
    private GuestbookAdminQueryService guestbookAdminQueryService;

    @Autowired
    private GuestbookAdminCommandService guestbookAdminCommandService;

    @GetMapping("/list")
    public Result<PageResult<GuestbookVO>> list(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Integer reviewStatus) {
        PageResult<GuestbookVO> result = guestbookAdminQueryService.list(page, size, reviewStatus);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<GuestbookVO> getById(@PathVariable Long id) {
        GuestbookVO vo = guestbookAdminQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "留言不存在");
        }
        return Result.success(vo);
    }

    @PostMapping("/{id}/approve")
    public Result<Void> approve(@PathVariable Long id) {
        guestbookAdminCommandService.approve(id);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    public Result<Void> reject(@PathVariable Long id) {
        guestbookAdminCommandService.reject(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        guestbookAdminCommandService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/visible")
    public Result<Void> setVisible(@PathVariable Long id, @RequestParam Integer isVisible) {
        guestbookAdminCommandService.setVisible(id, isVisible);
        return Result.success();
    }
}


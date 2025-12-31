package com.blog.controller.admin;

import com.blog.annotation.ApiOperation;
import com.blog.model.enums.ApiOperationType;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.GuestbookVO;
import com.blog.service.GuestbookAdminCommandService;
import com.blog.service.GuestbookAdminQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/guestbook")
@ApiOperation(name = "留言簿管理模块", description = "留言簿管理接口", open = false)
public class GuestbookAdminController {
    @Autowired
    private GuestbookAdminQueryService guestbookAdminQueryService;

    @Autowired
    private GuestbookAdminCommandService guestbookAdminCommandService;

    @GetMapping("/list")
    @ApiOperation(name = "查询留言列表", type = ApiOperationType.QUERY, description = "分页查询留言列表")
    public Result<PageResult<GuestbookVO>> list(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Integer reviewStatus) {
        PageResult<GuestbookVO> result = guestbookAdminQueryService.list(page, size, reviewStatus);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取留言详情", type = ApiOperationType.QUERY, description = "根据ID获取留言详情")
    public Result<GuestbookVO> getById(@PathVariable Long id) {
        GuestbookVO vo = guestbookAdminQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "留言不存在");
        }
        return Result.success(vo);
    }

    @PostMapping("/{id}/approve")
    @ApiOperation(name = "审核通过留言", type = ApiOperationType.ENABLE, description = "审核通过留言")
    public Result<Void> approve(@PathVariable Long id) {
        guestbookAdminCommandService.approve(id);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    @ApiOperation(name = "拒绝留言", type = ApiOperationType.DISABLE, description = "拒绝留言")
    public Result<Void> reject(@PathVariable Long id) {
        guestbookAdminCommandService.reject(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除留言", type = ApiOperationType.DELETE, description = "删除留言")
    public Result<Void> delete(@PathVariable Long id) {
        guestbookAdminCommandService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/visible")
    @ApiOperation(name = "设置留言可见性", type = ApiOperationType.UPDATE, description = "设置留言是否可见")
    public Result<Void> setVisible(@PathVariable Long id, @RequestParam Integer isVisible) {
        guestbookAdminCommandService.setVisible(id, isVisible);
        return Result.success();
    }
}

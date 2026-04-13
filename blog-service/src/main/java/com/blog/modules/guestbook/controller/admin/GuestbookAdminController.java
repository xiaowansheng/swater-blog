package com.blog.modules.guestbook.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
import com.blog.modules.guestbook.model.dto.GuestbookQueryDTO;
import com.blog.modules.guestbook.model.enums.GuestbookVisibilityStatus;
import com.blog.modules.guestbook.service.GuestbookCommandService;
import com.blog.modules.guestbook.service.GuestbookQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin/guestbook")
@ApiOperation(name = "留言簿管理模块", description = "留言簿管理接口", open = false)
public class GuestbookAdminController {
    @Autowired
    private GuestbookQueryService guestbookQueryService;

    @Autowired
    private GuestbookCommandService guestbookCommandService;

    @GetMapping("/list")
    @ApiOperation(name = "查询留言列表", type = ApiOperationType.QUERY, description = "分页查询留言列表")
    public Result<PageResult<GuestbookVO>> list(GuestbookQueryDTO queryDTO) {
        PageResult<GuestbookVO> result = guestbookQueryService.list(queryDTO);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取留言详情", type = ApiOperationType.QUERY, description = "根据ID获取留言详情")
    public Result<GuestbookVO> getById(@PathVariable Long id) {
        GuestbookVO vo = guestbookQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "留言不存在");
        }
        return Result.success(vo);
    }

    @PostMapping("/{id}/approve")
    @ApiOperation(name = "审核通过留言", type = ApiOperationType.ENABLE, description = "审核通过留言")
    public Result<Void> approve(@PathVariable Long id) {
        guestbookCommandService.approve(id);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    @ApiOperation(name = "拒绝留言", type = ApiOperationType.DISABLE, description = "拒绝留言")
    public Result<Void> reject(@PathVariable Long id) {
        guestbookCommandService.reject(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除留言", type = ApiOperationType.DELETE, description = "删除留言")
    public Result<Void> delete(@PathVariable Long id) {
        guestbookCommandService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/visible")
    @ApiOperation(name = "设置留言可见性", type = ApiOperationType.UPDATE, description = "设置留言是否可见")
    public Result<Void> setVisible(@PathVariable Long id, @RequestParam Integer isVisible) {
        guestbookCommandService.setVisible(id, isVisible);
        return Result.success();
    }

    @PostMapping("/{id}/set-visible")
    @ApiOperation(name = "设置为可见", type = ApiOperationType.ENABLE, description = "设置留言为可见状态")
    public Result<Void> setAsVisible(@PathVariable Long id) {
        guestbookCommandService.setVisible(id, GuestbookVisibilityStatus.VISIBLE.getCode());
        return Result.success();
    }

    @PostMapping("/{id}/set-hidden")
    @ApiOperation(name = "设置为隐藏", type = ApiOperationType.DISABLE, description = "设置留言为隐藏状态")
    public Result<Void> setAsHidden(@PathVariable Long id) {
        guestbookCommandService.setVisible(id, GuestbookVisibilityStatus.HIDDEN.getCode());
        return Result.success();
    }
}

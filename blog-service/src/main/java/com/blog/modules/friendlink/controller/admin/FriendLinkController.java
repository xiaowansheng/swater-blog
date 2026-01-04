package com.blog.modules.friendlink.controller.admin;



import com.blog.common.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.common.Result;
import com.blog.modules.friendlink.model.dto.FriendLinkDTO;
import com.blog.modules.friendlink.model.vo.FriendLinkVO;
import com.blog.modules.friendlink.service.FriendLinkService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/admin/friend-link")
@ApiOperation(name = "友链管理模块", description = "友链管理接口", open = false)
public class FriendLinkController {
    @Autowired
    private FriendLinkService friendLinkService;

    @GetMapping("/list")
    @ApiOperation(name = "查询友链列表", type = ApiOperationType.QUERY, description = "查询所有友链")
    public Result<List<FriendLinkVO>> list() {
        List<FriendLinkVO> list = friendLinkService.list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取友链详情", type = ApiOperationType.QUERY, description = "根据ID获取友链详情")
    public Result<FriendLinkVO> getById(@PathVariable Long id) {
        FriendLinkVO vo = friendLinkService.getById(id);
        if (vo == null) {
            return Result.error(404, "友链不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(name = "创建友链", type = ApiOperationType.CREATE, description = "创建新友链")
    public Result<Long> create(@Valid @RequestBody FriendLinkDTO dto) {
        Long id = friendLinkService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(name = "更新友链", type = ApiOperationType.UPDATE, description = "更新友链信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody FriendLinkDTO dto) {
        friendLinkService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除友链", type = ApiOperationType.DELETE, description = "删除友链")
    public Result<Void> delete(@PathVariable Long id) {
        friendLinkService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/approve")
    @ApiOperation(name = "审核通过友链", type = ApiOperationType.ENABLE, description = "审核通过友链申请")
    public Result<Void> approve(@PathVariable Long id) {
        friendLinkService.approve(id);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    @ApiOperation(name = "拒绝友链", type = ApiOperationType.DISABLE, description = "拒绝友链申请")
    public Result<Void> reject(@PathVariable Long id) {
        friendLinkService.reject(id);
        return Result.success();
    }
}


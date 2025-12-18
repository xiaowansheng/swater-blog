package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.dto.FriendLinkDTO;
import com.blog.model.vo.FriendLinkVO;
import com.blog.service.FriendLinkService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/friend-link")
@ApiResource(name = "友链管理接口")
public class FriendLinkController {
    @Autowired
    private FriendLinkService friendLinkService;

    @GetMapping("/list")
    public Result<List<FriendLinkVO>> list() {
        List<FriendLinkVO> list = friendLinkService.list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<FriendLinkVO> getById(@PathVariable Long id) {
        FriendLinkVO vo = friendLinkService.getById(id);
        if (vo == null) {
            return Result.error(404, "友链不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody FriendLinkDTO dto) {
        Long id = friendLinkService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody FriendLinkDTO dto) {
        friendLinkService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        friendLinkService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/approve")
    public Result<Void> approve(@PathVariable Long id) {
        friendLinkService.approve(id);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    public Result<Void> reject(@PathVariable Long id) {
        friendLinkService.reject(id);
        return Result.success();
    }
}


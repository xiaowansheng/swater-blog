package com.blog.modules.friendlink.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.friendlink.model.dto.FriendLinkApplicationDTO;
import com.blog.modules.friendlink.model.vo.FriendLinkVO;
import com.blog.modules.friendlink.service.FriendLinkPublicQueryService;
import com.blog.modules.friendlink.service.FriendLinkPublicService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("public/friend-link")
@ApiOperation(name = "友链公开接口", description = "友情链接相关接口", open = true)
public class FriendLinkPublicController {
    @Autowired
    private FriendLinkPublicQueryService friendLinkPublicQueryService;

    @Autowired
    private FriendLinkPublicService friendLinkPublicService;

    @GetMapping("/list")
    @ApiOperation(name = "获取友情链接列表", type = ApiOperationType.QUERY, description = "获取所有已通过的友情链接列表")
    public Result<List<FriendLinkVO>> list() {
        List<FriendLinkVO> list = friendLinkPublicQueryService.list();
        return Result.success(list);
    }

    @PostMapping("/apply")
    @ApiOperation(name = "申请友情链接", type = ApiOperationType.CREATE, description = "前台访客提交友链申请")
    public Result<Long> apply(@Valid @RequestBody FriendLinkApplicationDTO dto) {
        Long id = friendLinkPublicService.apply(dto);
        return Result.success("友链申请已提交，等待管理员审核", id);
    }
}


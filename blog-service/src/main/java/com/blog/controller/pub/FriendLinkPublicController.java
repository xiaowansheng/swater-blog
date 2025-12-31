package com.blog.controller.pub;

import com.blog.annotation.ApiOperation;
import com.blog.common.Result;
import com.blog.model.enums.ApiOperationType;
import com.blog.model.vo.FriendLinkVO;
import com.blog.service.FriendLinkPublicQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/friend-link")
@ApiOperation(name = "友链公开接口", description = "友情链接相关接口", open = true)
public class FriendLinkPublicController {
    @Autowired
    private FriendLinkPublicQueryService friendLinkPublicQueryService;

    @GetMapping("/list")
    @ApiOperation(name = "获取友情链接列表", type = ApiOperationType.QUERY, description = "获取所有已通过的友情链接列表")
    public Result<List<FriendLinkVO>> list() {
        List<FriendLinkVO> list = friendLinkPublicQueryService.list();
        return Result.success(list);
    }
}


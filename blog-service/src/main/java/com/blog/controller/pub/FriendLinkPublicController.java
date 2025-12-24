package com.blog.controller.pub;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.vo.FriendLinkVO;
import com.blog.service.FriendLinkPublicQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/friend-link")
@ApiResource(name = "友链公开接口", isOpen = true)
public class FriendLinkPublicController {
    @Autowired
    private FriendLinkPublicQueryService friendLinkPublicQueryService;

    @GetMapping("/list")
    public Result<List<FriendLinkVO>> list() {
        List<FriendLinkVO> list = friendLinkPublicQueryService.list();
        return Result.success(list);
    }
}


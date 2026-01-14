package com.blog.modules.statistics.track.controller.pub;


import com.blog.modules.statistics.track.model.dto.ContentLikeActionDTO;
import com.blog.modules.statistics.track.model.vo.ContentLikeResultVO;
import com.blog.modules.statistics.track.model.vo.ContentLikeStatusVO;
import com.blog.modules.statistics.track.service.ContentLikeService;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.shared.annotation.ApiOperation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("public/like")
@ApiOperation(name = "点赞公开接口", description = "内容点赞/取消赞接口", open = true)
public class ContentLikePublicController {
    @Autowired
    private ContentLikeService contentLikeService;

    @PostMapping
    @ApiOperation(name = "点赞/取消赞", type = ApiOperationType.CREATE, description = "对文章/说说点赞或取消点赞")
    public Result<ContentLikeResultVO> action(@RequestBody ContentLikeActionDTO dto, HttpServletRequest request) {
        return Result.success(contentLikeService.action(dto, request));
    }

    @GetMapping("/status")
    @ApiOperation(name = "点赞状态", type = ApiOperationType.QUERY, description = "查询访客对内容的点赞状态")
    public Result<ContentLikeStatusVO> status(
            @RequestParam String visitorUuid,
            @RequestParam String contentType,
            @RequestParam Long contentId
    ) {
        return Result.success(contentLikeService.status(visitorUuid, contentType, contentId));
    }
}

